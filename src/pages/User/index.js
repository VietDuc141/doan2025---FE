import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faPlus, faSync, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './AddUserModal';
import { useActiveUser, useUsers } from '~/api/queries/userQueries';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

const allColumns = [
    'Tên người dùng',
    'Thư điện tử',
    'Vai trò',
    'Ngày tạo',
    'Lần đăng nhập cuối',
    'Ngưng sử dụng',
    'Đã đăng nhập?',
    'ID',
    // { key: 'username', label: 'Tên người dùng', sortable: true },
    // { key: 'status', label: 'Trạng thái', sortable: true },
    // { key: 'homeFolder', label: 'Thư mục cá nhân', sortable: true },
    // { key: 'email', label: 'Thư điện tử', sortable: true },
    // { key: 'libraryQuota', label: 'Hạn ngạch Thư viện', sortable: true },
    // { key: 'lastLogin', label: 'Lần đăng nhập cuối', sortable: true },
    // { key: 'loggedIn', label: 'Đã đăng nhập?', sortable: true },
    // { key: 'retired', label: 'Ngưng sử dụng', sortable: true },
    // { key: 'actions', label: 'Row Menu', sortable: false },
];

function User() {
    const [visibleColumns, setVisibleColumns] = useState([
        'Tên người dùng',
        'Thư điện tử',
        'Vai trò',
        'Ngày tạo',
        'Lần đăng nhập cuối',
        'Ngưng sử dụng',
        'Đã đăng nhập?',
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showTidyModal, setShowTidyModal] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copyIcon, setCopyIcon] = useState(faCopy);
    const [showDropdown, setShowDropdown] = useState(false);

    const [uiFilters, setUiFilters] = useState({
        username: '',
        userType: 'Group Admin',
        retired: 'No',
        _id: '',
    });

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const { data, isLoading, isError, error, refetch } = useUsers();
    const activeUserMutation = useActiveUser();

    const handleRefresh = () => {
        setSelectedRows([]);
        setAllSelected(false);
        setUiFilters({ username: '', userType: '', _id: '', retired: 'No' }); // reset nếu muốn
        refetch(); // gọi lại API
    };

    const users = useMemo(
        () =>
            data?.data?.users.map((user) => ({
                'Tên người dùng': user.username,
                'Thư điện tử': user.email,
                'Vai trò': user.role,
                'Ngày tạo': user.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY HH:mm:ss') : '',
                'Lần đăng nhập cuối': user.lastLogin ? dayjs(user.lastLogin).format('DD/MM/YYYY HH:mm:ss') : '',
                'Ngưng sử dụng': user.isActive ? 'No' : 'Yes',
                'Đã đăng nhập?': user.lastLogin && user.lastLogin !== user.createdAt ? 'Yes' : 'No',
                ID: user._id,
            })) || [],
        [data],
    );

    const filteredUsers = users.filter(
        (user) => {
            const nameMatch = user['Tên người dùng'].toLowerCase().includes(uiFilters.username.toLowerCase());
            const typeMatch = user['Vai trò'].toLowerCase().includes(uiFilters.userType.toLowerCase());
            const retiredMatch = user['Ngưng sử dụng'].toLowerCase().includes(uiFilters.retired.toLowerCase());
            const idMatch = user['ID'].toLowerCase().includes(uiFilters._id.toLowerCase());
            return nameMatch && typeMatch && retiredMatch && idMatch;
        },
        [users, uiFilters],
    );

    const handleFilterChange = useCallback(
        (e) => {
            const { name, value } = e.target;

            // Luôn cập nhật UI ngay lập tức
            const newFilters = {
                ...uiFilters,
                [name]: value,
            };
            setUiFilters(newFilters);
        },
        [uiFilters],
    );

    const toggleColumn = (col) => {
        setVisibleColumns((prev) => {
            if (prev.includes(col)) {
                return prev.filter((c) => c !== col);
            } else {
                const newCols = [...prev, col];
                return allColumns.filter((c) => newCols.includes(c));
            }
        });
    };

    // Chọn tất cả các hàng
    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedRows([]);
            setAllSelected(false);
        } else {
            const allIndexes = users.map((_, index) => index);
            setSelectedRows(allIndexes);
            setAllSelected(true);
        }
    };

    // Chỉ chọn 1 hàng
    const handleRowClick = (index) => {
        setSelectedRows((prev) => {
            // Nếu đã chọn thì bỏ chọn
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index);
            }
            // Nếu chưa chọn thì thêm vào danh sách
            return [...prev, index];
        });
        setAllSelected(false);
    };

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredUsers.slice(start, end);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const TidyModal = () => {
        if (!showTidyModal) return null;

        const handleConfirm = async () => {
            try {
                setDeleteError(null);
                const promises = selectedRows.map((idx) => {
                    const userId = users[idx].ID;
                    return activeUserMutation.mutateAsync(userId);
                });

                await Promise.all(promises);
                setShowTidyModal(false);
                setSelectedRows([]); // Clear selection after delete
                setAllSelected(false);
            } catch (err) {
                setDeleteError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa nội dung');
            }
        };

        return (
            <div className={cx('modal')}>
                <div className={cx('modal-overlay')}>
                    <div className={cx('tidy-modal')}>
                        <div className={cx('tidy-modal-header')}>
                            <h2>Tidy Library</h2>
                            <button className={cx('close-button')} onClick={() => setShowTidyModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className={cx('tidy-modal-body')}>
                            <div className={cx('message')}>
                                <div>Dọn thư viện sẽ xóa những nội dung đã chọn.</div>
                                <div className={cx('data-info')}>
                                    Bạn đã chọn {selectedRows.length} nội dung. Bạn có chắc chắn muốn xóa?
                                </div>
                                {deleteError && <div className={cx('deleteError-message')}>{deleteError}</div>}
                            </div>
                        </div>
                        <div className={cx('tidy-modal-footer')}>
                            <button
                                className={cx('cancel')}
                                onClick={() => setShowTidyModal(false)}
                                disabled={activeUserMutation.isPending}
                            >
                                Hủy
                            </button>
                            <button
                                className={cx('confirm')}
                                onClick={handleConfirm}
                                disabled={activeUserMutation.isPending || selectedRows.length === 0}
                            >
                                {activeUserMutation.isPending ? 'Đang thực hiện...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('user')}>
            <div className={cx('header')}>
                <h2>Người sử dụng</h2>
                <div className={cx('actions')}>
                    <button
                        className={cx('refresh', { spinning: isLoading })}
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title="Làm mới danh sách"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add')} onClick={handleAddUser}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm người dùng
                    </button>
                    <button className={cx('clean')} onClick={() => setShowTidyModal(true)}>
                        <FontAwesomeIcon icon={faTrash} />
                        Ngưng tài khoản
                    </button>
                </div>
            </div>

            <div className={cx('filter-section')}>
                <div className={cx('filter-form')}>
                    <div className={cx('form-group')}>
                        <label>Tên người dùng</label>
                        <div className={cx('input-group')}>
                            <input
                                type="text"
                                name="username"
                                value={uiFilters.username}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>ID</label>
                        <div className={cx('input-group')}>
                            <input type="text" name="_id" value={uiFilters._id} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Người dùng Định nghĩa</label>
                        <div className={cx('input-group')}>
                            <select name="userType" value={uiFilters.userType} onChange={handleFilterChange}>
                                <option value=""></option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Ngưng sử dụng</label>
                        <div className={cx('input-group')}>
                            <select name="retired" value={uiFilters.retired} onChange={handleFilterChange}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('table-section')}>
                <div className={cx('table-controls')}>
                    <div className={cx('entries')}>
                        Show
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1); // reset về trang đầu
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        entries
                    </div>
                    <div className={cx('actions')}>
                        <div className={cx('dropdown-wrapper')}>
                            <button onClick={() => setShowDropdown(!showDropdown)}>Chọn cột hiển thị</button>
                            {showDropdown && (
                                <ul className={cx('dropdown-menu')}>
                                    {allColumns.map((col, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => toggleColumn(col)}
                                            className={cx({ selected: visibleColumns.includes(col) })}
                                            style={{
                                                backgroundColor: visibleColumns.includes(col) ? 'white' : 'inherit',
                                                color: visibleColumns.includes(col) ? '#000' : '#fff',
                                            }}
                                        >
                                            {col}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div className={cx('table-main')}>
                    <div className={cx('schedule-table-wrapper')}>
                        <table className={cx('schedule-table')}>
                            <thead>
                                <tr>
                                    {visibleColumns.map((col, idx) => (
                                        <th key={idx}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length + 1} className={cx('no-data')}>
                                            No data available in table
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((row, rowIdx) => (
                                        <tr
                                            key={rowIdx}
                                            onClick={() => handleRowClick(rowIdx)}
                                            className={cx({ selected: selectedRows.includes(rowIdx) })}
                                        >
                                            {visibleColumns.map((col, colIdx) => (
                                                <td key={colIdx}>{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={cx('table-footer')}>
                    <div className={cx('left')}>
                        <button className={cx('choose')} onClick={handleSelectAll}>
                            Chọn tất cả
                        </button>
                        <span>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}{' '}
                            entries
                        </span>
                    </div>
                    <div className={cx('right')}>
                        <span>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Tiếp
                        </button>
                    </div>
                </div>
            </div>

            {showAddModal && <AddUserModal onClose={handleCloseModal} />}
            <TidyModal />
        </div>
    );
}

export default User;
