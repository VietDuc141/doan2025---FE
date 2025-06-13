import classNames from 'classnames/bind';
import styles from './ProfileModal.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const cx = classNames.bind(styles);

function ProfileModal({ onClose, onSave }) {
    const [username, setUsername] = useState('admin');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = () => {
        let passwordChanged = false;
        if (newPassword && newPassword === confirmNewPassword && newPassword !== currentPassword) {
            passwordChanged = true;
            // Logic to update password
        }

        // Logic to save other profile info

        onSave(passwordChanged);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Thông tin tài khoản</h2>
                    <FontAwesomeIcon icon={faXmark} className={styles.closeIcon} onClick={onClose} />
                </div>
                <div className={styles.modalBody}>
                    <div className={cx('form-group-static')}>
                        <label>Tên người dùng</label>
                        <div className={cx('static-value')}>{username}</div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nếu bạn đang thay đổi mật khẩu, vui lòng nhập mật khẩu hiện tại của bạn."
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Hãy nhập mật khẩu mới của bạn"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Vui lòng nhập lại mật khẩu mới."
                        />
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Hủy
                    </button>
                    <button className={styles.saveBtn} onClick={handleSubmit}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;
