import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './GroupAccount.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import AddGroupModal from './AddGroupModal';

const cx = classNames.bind(styles);

const columns = [
    { key: 'userGroup', label: 'User Group', sortable: true },
    { key: 'libraryQuota', label: 'Hạn ngạch Thư viện', sortable: true },
    { key: 'systemNotification', label: 'Nhận thông báo hệ thống?', sortable: true },
    { key: 'displayNotification', label: 'Nhận thông báo hiển thị?', sortable: true },
    { key: 'isShownForAddUser', label: 'Is shown for Add User?', sortable: true },
    { key: 'actions', label: '', sortable: false },
];

const mockData = [
    {
        userGroup: 'Content Manager',
        libraryQuota: '',
        systemNotification: false,
        displayNotification: false,
        isShownForAddUser: true,
    },
    {
        userGroup: 'Display Manager',
        libraryQuota: '',
        systemNotification: false,
        displayNotification: true,
        isShownForAddUser: true,
    },
    {
        userGroup: 'Playlist Manager',
        libraryQuota: '',
        systemNotification: false,
        displayNotification: false,
        isShownForAddUser: true,
    },
    {
        userGroup: 'Schedule Manager',
        libraryQuota: '',
        systemNotification: false,
        displayNotification: false,
        isShownForAddUser: true,
    },
    {
        userGroup: 'System Notifications',
        libraryQuota: '',
        systemNotification: true,
        displayNotification: false,
        isShownForAddUser: false,
    },
    {
        userGroup: 'Users',
        libraryQuota: '',
        systemNotification: false,
        displayNotification: false,
        isShownForAddUser: false,
    },
];

function GroupAccount() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddGroup = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const renderStatusIcon = (value) => {
        return value ? (
            <FontAwesomeIcon icon={faCheck} className={cx('status-icon', 'check')} />
        ) : (
            <FontAwesomeIcon icon={faXmark} className={cx('status-icon', 'times')} />
        );
    };

    return (
        <div className={cx('group-account')}>
            <div className={cx('header')}>
                <h2>Nhóm tài khoản</h2>
                <div className={cx('actions')}>
                    <button className={cx('add')} onClick={handleAddGroup}>
                        <FontAwesomeIcon icon={faPlus} />
                        Add User Group
                    </button>
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </div>
            </div>

            <div className={cx('filter-section')}>
                <div className={cx('filter-form')}>
                    <div className={cx('form-group')}>
                        <label>Tên</label>
                        <input type="text" value={searchTerm} onChange={handleSearchChange} />
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

                <div className={cx('table-wrapper')}>
                    <table className={cx('group-table')}>
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className={cx({ sortable: column.sortable })}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mockData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.userGroup}</td>
                                    <td>{row.libraryQuota}</td>
                                    <td>{renderStatusIcon(row.systemNotification)}</td>
                                    <td>{renderStatusIcon(row.displayNotification)}</td>
                                    <td>{renderStatusIcon(row.isShownForAddUser)}</td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={cx('table-footer')}>
                    <div className={cx('showing-entries')}>Showing 1 to 6 of 6 entries</div>
                    <div className={cx('pagination')}>
                        <button disabled>Previous</button>
                        <button className={cx('active')}>1</button>
                        <button disabled>Tiếp</button>
                    </div>
                </div>
            </div>

            {showAddModal && <AddGroupModal onClose={handleCloseModal} />}
        </div>
    );
}

export default GroupAccount;
