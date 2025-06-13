import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '~/components/Modal/ProfileModal';

import styles from './Header.module.scss';
import images from '~/assets/images';

const cx = classNames.bind(styles);

function Header() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = () => {
        // Handle actual logout logic here (e.g., clear tokens)
        navigate('/login');
    };

    const handleProfileClick = () => {
        setShowDropdown(false);
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleSaveProfile = (passwordChanged) => {
        if (passwordChanged) {
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        }
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <a href="/" className={cx('logo')}>
                    <img src={images.logo} alt="Xibo" />
                </a>
                <div className={cx('action')}>
                    <FontAwesomeIcon className={cx('notification')} icon={faBell} />
                    <div className={cx('user-menu')} ref={dropdownRef}>
                        <FontAwesomeIcon
                            className={cx('information')}
                            icon={faUser}
                            onClick={() => setShowDropdown(!showDropdown)}
                        />
                        {showDropdown && (
                            <div className={cx('dropdown-menu')}>
                                <div className={cx('dropdown-item')} onClick={handleProfileClick}>
                                    Chỉnh sửa hồ sơ
                                </div>
                                <div className={cx('dropdown-item')} onClick={handleLogout}>
                                    Đăng xuất
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showProfileModal && <ProfileModal onClose={handleCloseProfileModal} onSave={handleSaveProfile} />}
            {showSuccessMessage && <div className={cx('success-message')}>Đã thay đổi mật khẩu</div>}
        </header>
    );
}

export default Header;
