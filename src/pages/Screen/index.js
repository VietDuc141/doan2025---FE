import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Screen.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faTimes, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const mockData = [
    {
        id: 1,
        name: 'DESKTOP-4FJ4FV3',
        type: 'Monitor / Other',
        status: true,
        authorized: true,
        registered: false,
        lastAccess: '2025-04-16 17:21',
        macAddress: '18:31:BF:2D:B8:74',
    },
    {
        id: 2,
        name: 'DESKTOP-GO8FTMT',
        type: '',
        status: true,
        authorized: false,
        registered: false,
        lastAccess: '2025-04-16 17:43',
        macAddress: '0A:00:27:00:00:10',
    },
];

function Screen() {
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [displayCode, setDisplayCode] = useState('');

    const AddDisplayModal = () => {
        if (!showAddModal) return null;

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('add-display-modal')}>
                    <div className={cx('modal-header')}>
                        <h2>Add Display via Code</h2>
                        <button className={cx('close-button')} onClick={() => setShowAddModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx('modal-body')}>
                        <div className={cx('info-box')}>
                            <p>
                                After submitting this form with valid code, your CMS Address and Key will be sent and
                                stored in the temporary storage in our Authentication Service.
                            </p>
                            <p>
                                The Player linked to the submitted code, will make regular calls to our Authentication
                                Service to retrive the CMS details and configure itself with them. Your details are
                                removed from the temporary storage once the Player is configured
                            </p>
                            <p>
                                Please note that your CMS needs to make a successful call to our Authentication Service
                                for this feature to work.
                            </p>
                        </div>
                        <div className={cx('form-group')}>
                            <label>Mã</label>
                            <input
                                type="text"
                                value={displayCode}
                                onChange={(e) => setDisplayCode(e.target.value)}
                                placeholder="Please provide the code displayed on the Player screen"
                            />
                        </div>
                    </div>
                    <div className={cx('modal-footer')}>
                        <button className={cx('cancel')} onClick={() => setShowAddModal(false)}>
                            Hủy
                        </button>
                        <button className={cx('save')}>Lưu</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('screen')}>
            <div className={cx('header')}>
                <h2>Màn hình</h2>
                <div className={cx('actions')}>
                    <button className={cx('add')} onClick={() => setShowAddModal(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm màn hình (Mã)
                    </button>
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </div>
            </div>

            <div className={cx('filter-section')}>
                <div className={cx('tabs')}>
                    <div
                        className={cx('tab', { active: activeTab === 'overview' })}
                        onClick={() => setActiveTab('overview')}
                    >
                        Tổng quan
                    </div>
                    <div
                        className={cx('tab', { active: activeTab === 'advanced' })}
                        onClick={() => setActiveTab('advanced')}
                    >
                        Nâng cao
                    </div>
                </div>

                <div className={cx('filter-form')}>
                    <div className={cx('form-group')}>
                        <label>ID</label>
                        <input type="text" />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Tên</label>
                        <input type="text" />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Trạng thái</label>
                        <select>
                            <option value=""></option>
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Đã đăng nhập?</label>
                        <select>
                            <option value=""></option>
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Đã được cấp phép?</label>
                        <select>
                            <option value=""></option>
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Đã đăng ký XMR?</label>
                        <select>
                            <option value=""></option>
                        </select>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Nhãn</label>
                        <input type="text" />
                    </div>
                </div>
            </div>

            <div className={cx('table-section')}>
                <div className={cx('table-controls')}>
                    <div className={cx('entries')}>
                        Show
                        <select>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        entries
                    </div>
                    <div className={cx('table-buttons')}>
                        <button>Chọn cột hiển thị</button>
                        <button>In</button>
                        <button>CSV</button>
                    </div>
                </div>

                <table className={cx('screen-table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Màn hình</th>
                            <th>Kiểu màn hình</th>
                            <th>Trạng thái</th>
                            <th>Đã được cấp phép?</th>
                            <th>Đã đăng nhập</th>
                            <th>Lần truy cập cuối</th>
                            <th>Địa chỉ MAC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.type}</td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={item.status ? faCheck : faXmark}
                                        className={cx('status-icon', {
                                            success: item.status,
                                            error: !item.status,
                                        })}
                                    />
                                </td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={item.authorized ? faCheck : faXmark}
                                        className={cx('status-icon', {
                                            success: item.authorized,
                                            error: !item.authorized,
                                        })}
                                    />
                                </td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={item.registered ? faCheck : faXmark}
                                        className={cx('status-icon', {
                                            success: item.registered,
                                            error: !item.registered,
                                        })}
                                    />
                                </td>
                                <td>{item.lastAccess}</td>
                                <td>{item.macAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={cx('table-footer')}>
                    <div className={cx('bulk-actions')}>
                        <button className={cx('select-all')}>Chọn tất cả</button>
                        <span>Showing 1 to 2 of 2 entries</span>
                    </div>
                    <div className={cx('pagination')}>
                        <button>Previous</button>
                        <button className={cx('active')}>1</button>
                        <button>Next</button>
                    </div>
                </div>
            </div>

            <AddDisplayModal />
        </div>
    );
}

export default Screen;
