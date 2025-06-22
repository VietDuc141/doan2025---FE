import classNames from 'classnames/bind';
import styles from './Play.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function Play() {
    const location = useLocation();
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        // Lấy dữ liệu playlist từ URL parameters
        const searchParams = new URLSearchParams(location.search);
        const playlistData = searchParams.get('playlist');
        if (playlistData) {
            try {
                const decodedPlaylist = JSON.parse(decodeURIComponent(playlistData));
                console.log("%c 1 --> Line: 21||index.js\n decodedPlaylist: ","color:#f0f;", decodedPlaylist);
                setPlaylist(decodedPlaylist);
            } catch (error) {
                console.error('Error parsing playlist data:', error);
            }
        }
    }, [location]);

    const handleContentEnd = useCallback(() => {
        // Chuyển sang nội dung tiếp theo
        setCurrentIndex(prevIndex => {
            if (prevIndex < playlist.length - 1) {
                return prevIndex + 1;
            }
            // Nếu đã phát hết, quay lại từ đầu
            return 0;
        });
    }, [playlist.length]);

    // Xử lý tự động chuyển ảnh
    useEffect(() => {
        if (!playlist.length || currentIndex >= playlist.length) return;

        const currentContent = playlist[currentIndex];
        if (currentContent.type === 'image' && isPlaying) {
            const duration = parseInt(currentContent.duration) * 1000; // Chuyển sang milliseconds
            const timer = setTimeout(handleContentEnd, duration);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isPlaying, playlist, handleContentEnd]);

    const renderContent = () => {
        if (!playlist.length || currentIndex >= playlist.length) {
            return <div className={cx('no-content')}>Không có nội dung để phát</div>;
        }

        const currentContent = playlist[currentIndex];

        if (currentContent.type === 'image') {
            return (
                <div className={cx('content-wrapper')}>
                    <img
                        src={currentContent.url}
                        alt={currentContent.name}
                        className={cx('content-display')}
                    />
                    <div className={cx('content-info')}>
                        <h3>{currentContent.name}</h3>
                        <p>Thời lượng: {currentContent.duration}s</p>
                    </div>
                </div>
            );
        } else if (currentContent.type === 'video') {
            return (
                <div className={cx('content-wrapper')}>
                    <video
                        src={currentContent.url}
                        className={cx('content-display')}
                        autoPlay
                        controls
                        onEnded={handleContentEnd}
                    />
                    <div className={cx('content-info')}>
                        <h3>{currentContent.name}</h3>
                        <p>Thời lượng: {currentContent.duration}</p>
                    </div>
                </div>
            );
        }

        return <div className={cx('unsupported-content')}>Định dạng không được hỗ trợ</div>;
    };

    return (
        <div className={cx('play-page')}>
            <div className={cx('content-container')}>
                {renderContent()}
            </div>
            <div className={cx('playlist-info')}>
                <div className={cx('current-info')}>
                    Đang phát: {currentIndex + 1}/{playlist.length}
                </div>
            </div>
        </div>
    );
}

export default Play;
