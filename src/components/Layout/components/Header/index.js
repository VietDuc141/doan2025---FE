import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'

import styles from './Header.module.scss'
import images from '~/assets/images'

const cx = classNames.bind(styles)

function Header() {
    return <header className={cx('wrapper')}>
        <div className={cx('inner')}>
            <a href='/' className={cx('logo')}>
                <img src={images.logo} alt='Xibo' />
            </a>
            <div className={cx('action')}>
                <FontAwesomeIcon className={cx('notification')} icon={faBell} />
                <FontAwesomeIcon className={cx('information')} icon={faUser} />
            </div>
        </div>
    </header>;
}

export default Header;