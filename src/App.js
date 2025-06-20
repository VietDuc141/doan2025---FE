import { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import { DefaultLayout } from '~/components/Layout';
import { initializeSocket, disconnectSocket } from './services/socketService';
import { useAuth } from '~/hooks/useAuth'; // You'll need to create this hook

function App() {
    const { user } = useAuth(); // Assuming you have an authentication context

    useEffect(() => {
        console.log("%c 1 --> Line: 12||App.js\n user?.id: ","color:#f0f;", user?.id);
        if (user?.id) {
            const socket = initializeSocket(user.id);
            console.log("%c 1 --> Line: 14||App.js\n socket: ","color:#f0f;", socket);

            // Listen for user status changes
            socket.on('user-status-change', (data) => {
                // Here you can update your application state with the user's status
                console.log('User status changed:', data);
                // You might want to update a user context or state management system here
            });

            return () => {
                disconnectSocket();
            };
        }
    }, [user]);

    return (
        <Router>
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
            </div>
        </Router>
    );
}

export default App;
