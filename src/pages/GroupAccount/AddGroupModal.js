import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './GroupAccount.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const TABS = {
    GENERAL: 'Tổng quan',
    NOTIFICATIONS: 'Thông báo',
};

const QUOTA_UNITS = [
    { value: 'B', label: 'B' },
    { value: 'KiB', label: 'KiB' },
    { value: 'MiB', label: 'MiB' },
    { value: 'GiB', label: 'GiB' },
    { value: 'TiB', label: 'TiB' },
];

function AddGroupModal({ onClose }) {
    const [activeTab, setActiveTab] = useState(TABS.GENERAL);
    const [formData, setFormData] = useState({
        name: '',
        libraryQuota: '',
        unit: 'KiB',
        systemNotification: false,
        displayNotification: false,
        dataSetNotification: false,
        layoutNotification: false,
        libraryNotification: false,
        reportNotification: false,
        scheduleNotification: false,
        customNotification: false,
    });
    const [errors, setErrors] = useState({
        name: '',
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Tên nhóm người dùng là bắt buộc';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            // Handle save logic here
            onClose();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.GENERAL:
                return (
                    <div className={cx('tab-content', 'general-tab')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="name">
                                Tên <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={cx({ error: errors.name })}
                            />
                            {errors.name && <div className={cx('error-text')}>{errors.name}</div>}
                            <div className={cx('help-text')}>Tên của nhóm người dùng này</div>
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="libraryQuota">Hạn ngạch Thư viện</label>
                            <div className={cx('quota-input')}>
                                <input
                                    type="number"
                                    id="libraryQuota"
                                    name="libraryQuota"
                                    value={formData.libraryQuota}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1"
                                />
                                <select name="unit" value={formData.unit} onChange={handleInputChange}>
                                    {QUOTA_UNITS.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={cx('help-text')}>
                                Hạn ngạch nên được áp dụng. Nhập 0 để không có hạn ngạch.
                            </div>
                        </div>
                    </div>
                );
            case TABS.NOTIFICATIONS:
                return (
                    <div className={cx('tab-content', 'notifications-tab')}>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="systemNotification"
                                    checked={formData.systemNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo hệ thống?
                            </label>
                            <div className={cx('help-text')}>
                                Các thành viên trong nhóm này có nên nhận thông báo hệ thống không?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="displayNotification"
                                    checked={formData.displayNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo hiển thị?
                            </label>
                            <div className={cx('help-text')}>
                                Các thành viên trong nhóm này có nên nhận thông báo hiển thị cho các màn hình mà họ có
                                quyền xem không?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="dataSetNotification"
                                    checked={formData.dataSetNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo tập dữ liệu?
                            </label>
                            <div className={cx('help-text')}>
                                Should members of this Group receive DataSet notification emails?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="layoutNotification"
                                    checked={formData.layoutNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo bố cục?
                            </label>
                            <div className={cx('help-text')}>
                                Should members of this Group receive Layout notification emails?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="libraryNotification"
                                    checked={formData.libraryNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo thư viện?
                            </label>
                            <div className={cx('help-text')}>
                                Các thành viên trong nhóm này có nên nhận email thông báo thư viện không?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="reportNotification"
                                    checked={formData.reportNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo về báo cáo?
                            </label>
                            <div className={cx('help-text')}>
                                Should members of this Group receive Report notification emails?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="scheduleNotification"
                                    checked={formData.scheduleNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo lịch trình?
                            </label>
                            <div className={cx('help-text')}>
                                Should members of this Group receive Schedule notification emails?
                            </div>
                        </div>
                        <div className={cx('notification-option')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="customNotification"
                                    checked={formData.customNotification}
                                    onChange={handleInputChange}
                                />
                                Nhận thông báo tùy chỉnh?
                            </label>
                            <div className={cx('help-text')}>
                                Các thành viên trong nhóm này có nên nhận email thông báo cho các thông báo được tạo thủ
                                công trong CMS không?
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('add-group-modal')}>
                <div className={cx('modal-header')}>
                    <h2>Add User Group</h2>
                    <button className={cx('close-button')} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className={cx('modal-tabs')}>
                    {Object.values(TABS).map((tab) => (
                        <button
                            key={tab}
                            className={cx('tab-button', { active: activeTab === tab })}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className={cx('modal-body')}>{renderTabContent()}</div>

                <div className={cx('modal-footer')}>
                    <button className={cx('cancel')} onClick={onClose}>
                        Hủy
                    </button>
                    <button className={cx('save')} onClick={handleSave}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddGroupModal;
