import React, { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './PlayerModal.module.scss';
import { usePlayer } from '~/contexts/PlayerContext';

const cx = classNames.bind(styles);

function PlayerModal() {
    const containerRef = useRef(null);
    const {
        deviceId,
        playlist,
        currentIndex,
        isPlaying,
        isConnected,
        isLoading,
        handleContentEnd,
        currentContent,
        showModal
    } = usePlayer();

    // Handle fullscreen
    useEffect(() => {
        const container = containerRef.current;
        if (container && currentContent && isPlaying && showModal) {
            const enterFullscreen = async () => {
                try {
                    if (container.requestFullscreen) {
                        await container.requestFullscreen();
                    } else if (container.webkitRequestFullscreen) {
                        await container.webkitRequestFullscreen();
                    } else if (container.msRequestFullscreen) {
                        await container.msRequestFullscreen();
                    }
                } catch (error) {
                    console.error('Error entering fullscreen:', error);
                }
            };
            enterFullscreen();
        }

        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            }
        };
    }, [currentContent, isPlaying, showModal]);

    const renderContent = () => {
        if (!isConnected || !currentContent) {
            return null;
        }

        if (isLoading) {
            return null;
        }

        if (currentContent.type === 'image') {
            return (
                <div className={cx('content-wrapper')}>
                    <img
                        src={currentContent.url}
                        alt={currentContent.name}
                        className={cx('content-display')}
                    />
                </div>
            );
        } else if (currentContent.type === 'video') {
            return (
                <div className={cx('content-wrapper')}>
                    <video
                        src={currentContent.url}
                        className={cx('content-display')}
                        autoPlay
                        controls={true}
                        onEnded={handleContentEnd}
                    />
                </div>
            );
        }

        return null;
    };

    // Handle auto-advance for images
    useEffect(() => {
        if (!currentContent || !isPlaying || !showModal) return;

        if (currentContent.type === 'image') {
            const duration = parseInt(currentContent.duration) * 1000; // Convert to milliseconds
            const timer = setTimeout(handleContentEnd, duration);
            return () => clearTimeout(timer);
        }
    }, [currentContent, isPlaying, showModal, handleContentEnd]);

    // Don't render anything if modal shouldn't be shown
    if (!showModal || !currentContent) {
        return null;
    }

    return (
        <div className={cx('player-modal')} ref={containerRef}>
            {renderContent()}
        </div>
    );
}

export default PlayerModal; 