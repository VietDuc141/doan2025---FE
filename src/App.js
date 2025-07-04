import { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import { DefaultLayout } from '~/components/Layout';
import { ToastContainer } from 'react-toastify';
import { disconnectSocket, initializeSocket } from './services/socketService';
import { useAuth } from '~/hooks/useAuth';
import { PlayerProvider } from './contexts/PlayerContext';
import PlayerModal from './components/Modal/PlayerModal';

function App() {
    const { user } = useAuth();

    useEffect(() => {
        let userSocket = null;
        if (user?._id) {
            userSocket = initializeSocket(user._id);

            // Listen for user status changes
            userSocket.on('user-status-change', (data) => {
                console.log('[User] Status changed:', data);
            });
        }

        return () => {
            if (userSocket) {
                disconnectSocket();
            }
        };
    }, [user]);

    return (
        <Router>
            <PlayerProvider>
                <div className="App">
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            let Layout = DefaultLayout;

                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            }
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}
                    </Routes>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <PlayerModal />
                </div>
            </PlayerProvider>
        </Router>
    );
}

export default App;
