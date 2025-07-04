import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import instance from '../api/axios';

const PlayerContext = createContext();

// Create a separate socket instance for player connections
let playerSocket = null;

// Base URL for content files
const CONTENT_BASE_URL = 'http://localhost:3001/uploads/';

const log = {
    info: (...args) => console.log('[Player]', ...args),
    error: (...args) => console.error('[Player]', ...args),
    warn: (...args) => console.warn('[Player]', ...args),
    debug: (...args) => console.debug('[Player]', ...args)
};

export function PlayerProvider({ children }) {
    const [deviceId] = useState(() => {
        // Try to get existing deviceId from localStorage or create a new one
        const savedDeviceId = localStorage.getItem('player_device_id');
        if (savedDeviceId) return savedDeviceId;

        const newDeviceId = uuidv4();
        localStorage.setItem('player_device_id', newDeviceId);
        return newDeviceId;
    });

    // Function to check if content has been played
    const hasPlayedContent = (campaignId) => {
        const playHistory = JSON.parse(localStorage.getItem('player_history') || '{}');
        return playHistory[campaignId];
    };

    // Function to mark content as played
    const markContentAsPlayed = (campaignId) => {
        const playHistory = JSON.parse(localStorage.getItem('player_history') || '{}');
        playHistory[campaignId] = new Date().toISOString();
        localStorage.setItem('player_history', JSON.stringify(playHistory));
    };

    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Function to start playback
    const startPlayback = () => {
        log.info('Starting playback');
        setAutoPlay(true);
        setIsPlaying(true);
    };

    // Function to stop playback
    const stopPlayback = () => {
        log.info('Stopping playback');
        setAutoPlay(false);
        setIsPlaying(false);
        setCurrentIndex(0);
    };

    // Function to handle user interaction
    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            // Check if current campaign has been played
            if (playlist.length > 0) {
                const currentCampaign = playlist[currentIndex]?.campaignId;
                if (currentCampaign && hasPlayedContent(currentCampaign)) {
                    log.info('Campaign already played, skipping:', currentCampaign);
                    return;
                }
            }

            log.info('First user interaction detected, preparing to show modal');
            setHasUserInteracted(true);
            setShowModal(true);
            setIsPlaying(true);
        }
    };

    // Set up user interaction listeners
    useEffect(() => {
        if (hasUserInteracted) return; // Only set up listeners if user hasn't interacted yet

        // const interactionEvents = [
        //     'mousedown', 'mousemove', 'keydown',
        //     'scroll', 'touchstart', 'wheel'
        // ];

        const interactionEvents = [
            'mousedown', 'keydown',
            'scroll', 'touchstart', 'wheel'
        ];

        const handleInteraction = () => {
            handleUserInteraction();
            // Remove listeners after first interaction
            interactionEvents.forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };

        // Add listeners for all interaction events
        interactionEvents.forEach(event => {
            window.addEventListener(event, handleInteraction);
        });

        return () => {
            // Cleanup listeners
            interactionEvents.forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };
    }, [hasUserInteracted]);

    // Function to fetch content details
    const fetchContentDetails = async (contentId) => {
        try {
            const response = await instance.get(`/content/${contentId}`);
            const content = response.data.data.content;
            // Add base URL to content URL
            if (content && content.url) {
                content.url = `${CONTENT_BASE_URL}${content.url}`;
            }
            return content;
        } catch (error) {
            log.error('Error fetching content details:', error);
            return null;
        }
    };

    // Check if current time is within campaign schedule
    const isWithinSchedule = (schedule) => {
        if (!schedule) {
            log.info('No schedule defined, allowing playback');
            return true;
        }

        const now = new Date();
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(schedule.endDate);

        log.info('Checking schedule:', {
            now: now.toISOString(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        // Chỉ kiểm tra thời gian bắt đầu và kết thúc
        const isWithinRange = now >= startDate && now <= endDate;
        log.info('Schedule check result:', isWithinRange);
        return isWithinRange;
    };

    // Function to process campaign content
    const processCampaignContent = async (campaigns) => {
        setIsLoading(true);
        try {
            const processedContent = [];

            log.info('Processing campaigns:', campaigns);

            for (const item of campaigns) {
                const campaign = item.campaign;
                log.info('Processing campaign:', campaign.name);

                // Skip if campaign has been played
                if (hasPlayedContent(campaign._id)) {
                    log.info('Campaign already played, skipping:', campaign.name);
                    continue;
                }

                // Kiểm tra campaign có active không
                if (!campaign.isActive) {
                    log.info('Campaign not active:', campaign.name);
                    continue;
                }

                // Kiểm tra lịch phát
                const isScheduled = isWithinSchedule(campaign.schedule);
                log.info('Campaign schedule check:', {
                    name: campaign.name,
                    isScheduled
                });

                // Chỉ xử lý content nếu campaign đang trong thời gian phát
                if (isScheduled && campaign.contents && Array.isArray(campaign.contents)) {
                    for (const content of campaign.contents) {
                        // Fetch full content details
                        const contentDetails = await fetchContentDetails(content.content);
                        if (contentDetails) {
                            processedContent.push({
                                ...contentDetails,
                                duration: content.duration || contentDetails.duration,
                                order: content.order,
                                campaignId: campaign._id,
                                campaignName: campaign.name,
                                schedule: campaign.schedule
                            });
                            log.info('Added content to playlist:', contentDetails.name);
                        }
                    }
                }
            }

            // Sort by order if needed
            processedContent.sort((a, b) => a.order - b.order);

            log.info('Final processed content:', processedContent);
            setPlaylist(processedContent);
            setCurrentIndex(0);
            setIsPlaying(processedContent.length > 0);
        } catch (error) {
            log.error('Error processing campaign content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check schedule periodically
    useEffect(() => {
        const checkSchedule = () => {
            if (playlist.length > 0) {
                const currentContent = playlist[currentIndex];
                if (currentContent && currentContent.schedule) {
                    const shouldPlay = isWithinSchedule(currentContent.schedule);
                    log.info('Schedule check:', {
                        content: currentContent.name,
                        shouldPlay
                    });
                    setIsPlaying(shouldPlay);
                }
            }
        };

        // Check immediately
        checkSchedule();

        // Check every minute
        const interval = setInterval(checkSchedule, 60000);
        return () => clearInterval(interval);
    }, [playlist, currentIndex]);

    useEffect(() => {
        if (!playerSocket) {
            log.info('Initializing player socket connection...', { deviceId });

            playerSocket = io('http://localhost:3001', {
                autoConnect: true,
                reconnection: true,
            });

            playerSocket.on('connect', () => {
                setIsConnected(true);
                log.info('Connected to socket server', { socketId: playerSocket.id });

                // Register this player with the socket server
                playerSocket.emit('register-player', { deviceId });
                log.info('Sent player registration request', { deviceId });
            });

            playerSocket.on('disconnect', () => {
                setIsConnected(false);
                log.warn('Disconnected from socket server');
            });

            playerSocket.on('connect_error', (error) => {
                log.error('Socket connection error:', error.message);
                setIsConnected(false);
            });

            // Listen for content updates
            playerSocket.on('content-update', (content) => {
                log.info('Received content update:', content);
                if (content && Array.isArray(content)) {
                    processCampaignContent(content);
                }
            });

            // Listen for settings updates
            playerSocket.on('settings-update', (settings) => {
                log.info('Received settings update:', settings);
                if (settings.hasOwnProperty('isPlaying')) {
                    setIsPlaying(settings.isPlaying);
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (playerSocket) {
                log.info('Cleaning up player socket connection');
                playerSocket.off('connect');
                playerSocket.off('disconnect');
                playerSocket.off('connect_error');
                playerSocket.off('content-update');
                playerSocket.off('settings-update');
                playerSocket.disconnect();
                playerSocket = null;
            }
        };
    }, [deviceId]);

    const handleContentEnd = () => {
        log.info('Content ended, moving to next item');
        setCurrentIndex(prevIndex => {
            if (prevIndex >= playlist.length - 1) {
                // If this is the last item, stop playing and close modal
                log.info('Reached end of playlist, stopping playback and closing modal');
                // Mark current campaign as played
                if (playlist[prevIndex]) {
                    markContentAsPlayed(playlist[prevIndex].campaignId);
                }
                setIsPlaying(false);
                setShowModal(false);
                setHasUserInteracted(false);
                return prevIndex;
            }
            // Otherwise move to next item
            const nextIndex = prevIndex + 1;
            log.info(`Moving from index ${prevIndex} to ${nextIndex}`);
            return nextIndex;
        });
    };

    const value = {
        deviceId,
        playlist,
        currentIndex,
        isPlaying,
        isConnected,
        isLoading,
        handleContentEnd,
        currentContent: playlist[currentIndex],
        autoPlay,
        startPlayback,
        stopPlayback,
        showModal,
        setShowModal,
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
} 