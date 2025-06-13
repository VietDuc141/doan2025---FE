import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import images from '~/assets/images';

const cx = classNames.bind(styles);

function Login() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('login-container')}>
                <div className={cx('logo')}>
                    <img src={images.logo} alt="Xibo" />
                </div>
                <div className={cx('form')}>
                    <h2>Đăng nhập</h2>
                    <div className={cx('form-group')}>
                        <label>Tên đăng nhập</label>
                        <input type="text" placeholder="Nhập tên đăng nhập" />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mật khẩu</label>
                        <input type="password" placeholder="Nhập mật khẩu" />
                    </div>
                    <button className={cx('login-btn')}>Đăng nhập</button>
                </div>
            </div>
        </div>
    );
}

export default Login;
