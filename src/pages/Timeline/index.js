// Timeline Page with Dropdown Column Selector and Add Modal UI

import classNames from 'classnames/bind';
import styles from './Timeline.module.scss';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const allColumns = ['Tên', 'Mô tả', 'Thời gian bắt đầu', 'Thời gian kết thúc'];

const mockData = [
    {
        Tên: 'Custom',
        'Mô tả': 'User specifies the from/to date',
        'Thời gian bắt đầu': '',
        'Thời gian kết thúc': '',
    },
    {
        Tên: 'Always',
        'Mô tả': 'Event runs always',
        'Thời gian bắt đầu': '',
        'Thời gian kết thúc': '',
    },
];

function Timeline() {
    const [visibleColumns, setVisibleColumns] = useState(['Tên', 'Mô tả', 'Thời gian bắt đầu']);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [timelines, setTimelines] = useState(mockData.map((item, idx) => ({ ...item, id: idx + 1 })));

    // Chọn cột hiển thị cho bảng
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
            const allIndexes = timelines.map((_, index) => index);
            setSelectedRows(allIndexes);
            setAllSelected(true);
        }
    };

    // Chỉ chọn 1 hàng
    const handleRowClick = (index) => {
        // Nếu hàng đó đã được chọn → bỏ chọn
        if (selectedRows.length === 1 && selectedRows[0] === index) {
            setSelectedRows([]);
            setAllSelected(false);
        } else {
            setSelectedRows([index]);
            setAllSelected(false);
        }
    };

    // Hàm xóa timeline theo id
    const handleDeleteTimeline = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa timeline này?')) {
            setTimelines((prev) => prev.filter((timeline) => timeline.id !== id));
        }
    };

    return (
        <div className={cx('timeline')}>
            <div className={cx('header')}>
                <h2>Khung giờ phát</h2>
                <div className={cx('actions')}>
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add')} onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm khung giờ
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Ngưng sử dụng</label>
                    <select>
                        <option>Không</option>
                        <option>Có</option>
                    </select>
                </div>
            </div>

            <div className={cx('table-container')}>
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
                <table className={cx('schedule-table')}>
                    <thead>
                        <tr>
                            {visibleColumns.map((col, idx) => (
                                <th key={idx}>{col}</th>
                            ))}
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timelines.map((row, rowIdx) => (
                            <tr
                                key={row.id}
                                onClick={() => handleRowClick(rowIdx)}
                                className={cx({ selected: selectedRows.includes(rowIdx) })}
                            >
                                {visibleColumns.map((col, colIdx) => (
                                    <td key={colIdx}>{row[col]}</td>
                                ))}
                                <td>
                                    <button
                                        className={cx('delete-button')}
                                        title="Xóa timeline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTimeline(row.id);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={cx('table-footer')}>
                    <div className={cx('left')}>
                        <button className={cx('choose')} onClick={handleSelectAll}>
                            Chọn tất cả
                        </button>
                        <button className={cx('share')}>Share</button>
                        <span>Showing 1 to 2 of 2 entries</span>
                    </div>
                    <div className={cx('right')}>
                        <button>Trước</button>
                        <button>Tiếp</button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={cx('modal')}>
                    <div className={cx('modal-overlay')} onClick={() => setShowModal(false)} />
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm khung giờ</h3>
                            <button className={cx('close')} onClick={() => setShowModal(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className={cx('modal-body')}>
                            <div className={cx('form-group')}>
                                <label>Tên</label>
                                <input type="text" />
                                <small>Tên cho sự kiện này</small>
                            </div>
                            <div className={cx('form-group', 'choose-time')}>
                                <label>
                                    Sử dụng thời gian tương đối?
                                    <input type="checkbox" />
                                </label>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Thời gian bắt đầu</label>
                                <input type="datetime-local" />
                                <small>Chọn khung thời gian bắt đầu cho sự kiện này</small>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Thời gian kết thúc</label>
                                <input type="datetime-local" />
                                <small>Chọn khung thời gian kết thúc cho sự kiện này</small>
                            </div>
                        </div>

                        <div className={cx('modal-footer')}>
                            <button className={cx('cancel')} onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
                            <button className={cx('submit')}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Timeline;
