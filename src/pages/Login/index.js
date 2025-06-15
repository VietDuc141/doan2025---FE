import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import images from '~/assets/images';
import { useLogin } from '~/api/queries/authQueries';

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    const loginMutation = useLogin();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await loginMutation.mutateAsync(credentials);
            navigate('/'); // Chuyển về trang chủ sau khi đăng nhập thành công
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('login-container')}>
                <div className={cx('logo')}>
                    <img src={images.logo} alt="Xibo" />
                </div>
                <form className={cx('form')} onSubmit={handleSubmit}>
                    <h2>Đăng nhập</h2>
                    {error && <div className={cx('error-message')}>{error}</div>}
                    <div className={cx('form-group')}>
                        <label>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleInputChange}
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            placeholder="Nhập mật khẩu"
                        />
                    </div>
                    <button
                        type="submit"
                        className={cx('login-btn')}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
