import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useCreateUser } from '~/api/queries/userQueries';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const STEPS = {
    CREATE: 1,
    CREDENTIALS: 2,
};

function AddUserModal({ onClose }) {
    const [currentStep, setCurrentStep] = useState(STEPS.CREATE);
    const [selectedRole, setSelectedRole] = useState('');
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        email: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        password: '',
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const validateCredentials = () => {
        const newErrors = {
            username: '',
            password: '',
        };
        let isValid = true;

        if (!credentials.username.trim()) {
            newErrors.username = 'Tên người dùng là bắt buộc';
            isValid = false;
        }

        if (!credentials.password.trim()) {
            newErrors.password = 'Mật khẩu là bắt buộc';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCredentialsChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleNext = () => {
        if (currentStep === STEPS.CREDENTIALS) {
            if (!validateCredentials()) {
                return;
            }
        }
        if (currentStep < STEPS.CREDENTIALS) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > STEPS.CREATE) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const createUserMutation = useCreateUser();

    const handleSave = async () => {
        const userData = {
            username: credentials.username,
            password: credentials.password,
            email: credentials.email,
            role: selectedRole,
            fullName: credentials.username,
        };

        try {
            await createUserMutation.mutateAsync(userData);
            console.log('useCreateUser', userData);
            toast.success('Tạo người dùng thành công!');
            onClose();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Tạo người dùng thất bại!');
        }
    };

    const isNextDisabled = () => {
        if (currentStep === STEPS.CREDENTIALS) {
            return !credentials.username.trim() || !credentials.password.trim();
        }
        return false;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.CREATE:
                return (
                    <div className={cx('create-section')}>
                        <h3>Create</h3>
                        <p className={cx('help-text')}>
                            Select the role which most closely matches what you want this User to do, or select manual.
                        </p>
                        <div className={cx('role-options')}>
                            <div className={cx('role-option')}>
                                <input
                                    type="radio"
                                    id="admin"
                                    name="role"
                                    checked={selectedRole === 'admin'}
                                    onChange={() => handleRoleSelect('admin')}
                                />
                                <div className={cx('role-info')}>
                                    <div className={cx('role-name')}>Admin</div>
                                    <div className={cx('role-description')}>
                                        Management of all features related to Content Creation only.
                                    </div>
                                </div>
                            </div>
                            <div className={cx('role-option')}>
                                <input
                                    type="radio"
                                    id="user"
                                    name="role"
                                    checked={selectedRole === 'user'}
                                    onChange={() => handleRoleSelect('user')}
                                />
                                <div className={cx('role-info')}>
                                    <div className={cx('role-name')}>User</div>
                                    <div className={cx('role-description')}>
                                        Management of all features for the purpose of Display Administration only.
                                    </div>
                                </div>
                            </div>
                            {/*<div className={cx('role-option')}>
                                <input
                                    type="radio"
                                    id="plan-manager"
                                    name="role"
                                    checked={selectedRole === 'plan-manager'}
                                    onChange={() => handleRoleSelect('plan-manager')}
                                />
                                <div className={cx('role-info')}>
                                    <div className={cx('role-name')}>Plan Manager</div>
                                    <div className={cx('role-description')}>
                                        Management of all features for the purpose of Plan Administration only.
                                    </div>
                                </div>
                            </div>
                            <div className={cx('role-option')}>
                                <input
                                    type="radio"
                                    id="campaign-manager"
                                    name="role"
                                    checked={selectedRole === 'campaign-manager'}
                                    onChange={() => handleRoleSelect('campaign-manager')}
                                />
                                <div className={cx('role-info')}>
                                    <div className={cx('role-name')}>Campaign Manager</div>
                                    <div className={cx('role-description')}>
                                        Management of specific Campaigns to edit / replace.
                                    </div>
                                </div>
                            </div>
                            <div className={cx('role-option')}>
                                <input
                                    type="radio"
                                    id="timeline-manager"
                                    name="role"
                                    checked={selectedRole === 'timeline-manager'}
                                    onChange={() => handleRoleSelect('timeline-manager')}
                                />
                                <div className={cx('role-info')}>
                                    <div className={cx('role-name')}>Timeline Manager</div>
                                    <div className={cx('role-description')}>
                                        Management of all features for the purpose of Event Timeline only.
                                    </div>
                                </div>
                            </div>*/}
                        </div>
                    </div>
                );
            case STEPS.CREDENTIALS:
                return (
                    <div className={cx('credentials-section')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="username">
                                Tên người dùng <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleCredentialsChange}
                                className={cx({ error: errors.username })}
                            />
                            {errors.username && <div className={cx('error-text')}>{errors.username}</div>}
                            <div className={cx('help-text')}>Tên đăng nhập của người sử dụng</div>
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="password">
                                Mật khẩu <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleCredentialsChange}
                                className={cx({ error: errors.password })}
                            />
                            {errors.password && <div className={cx('error-text')}>{errors.password}</div>}
                            <div className={cx('help-text')}>Mật khẩu cho người dùng này</div>
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="email">Thư điện tử</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleCredentialsChange}
                            />
                            <div className={cx('help-text')}>Địa chỉ thư điện tử cho người dùng này</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('add-user-modal')}>
                <div className={cx('modal-header')}>
                    <h2>Add New User</h2>
                    <button className={cx('close-button')} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className={cx('steps')}>
                    <div className={cx('step')}>
                        <div
                            className={cx('step-number', {
                                active: currentStep === STEPS.CREATE,
                                completed: currentStep > STEPS.CREATE,
                            })}
                        >
                            1
                        </div>
                        <div className={cx('step-label')}>Create</div>
                    </div>
                    <div className={cx('step')}>
                        <div
                            className={cx('step-number', {
                                active: currentStep === STEPS.CREDENTIALS,
                                completed: currentStep > STEPS.CREDENTIALS,
                            })}
                        >
                            2
                        </div>
                        <div className={cx('step-label')}>Credentials</div>
                    </div>
                </div>

                <div className={cx('modal-body')}>{renderStepContent()}</div>

                <div className={cx('modal-footer')}>
                    <button className={cx('cancel')} onClick={onClose}>
                        Đóng
                    </button>
                    {currentStep > STEPS.CREATE && (
                        <button className={cx('cancel')} onClick={handleBack}>
                            Back
                        </button>
                    )}
                    {currentStep < STEPS.CREDENTIALS ? (
                        <button className={cx('next')} onClick={handleNext} disabled={isNextDisabled()}>
                            Tiếp
                        </button>
                    ) : (
                        <button className={cx('save')} onClick={handleSave}>
                            Lưu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddUserModal;
