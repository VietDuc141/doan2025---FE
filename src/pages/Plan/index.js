import classNames from 'classnames/bind';
import styles from './Plan.module.scss';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faPlus, faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Plan() {
    const [showModal, setShowModal] = useState(false);
    const [timeFrame, setTimeFrame] = useState('Always');

    const [rangeOption, setRangeOption] = useState('Chọn phạm vi');

    const fixedColumnOrder = [
        'ID',
        'Loại sự kiện',
        'Tên',
        'Start',
        'End',
        'Sự kiện',
        'ID Đợt phát',
        'Nhóm Màn Hình',
        'SoV',
        'Số lượt phát tối đa mỗi giờ',
        'Nhận biết vị trí?',
        'Lặp lại?',
        'Ưu tiên',
        'Tiêu chí',
        'Created On',
        'Updated On',
    ];

    const [visibleColumns, setVisibleColumns] = useState([
        'ID',
        'Loại sự kiện',
        'Tên',
        'Start',
        'End',
        'Sự kiện',
        'ID Đợt phát',
        'Nhóm Màn Hình',
        'SoV',
        'Số lượt phát tối đa mỗi giờ',
        'Nhận biết vị trí?',
        'Lặp lại?',
        'Ưu tiên?',
        'Tiêu chí?',
    ]);

    const [showColumnDropdown, setShowColumnDropdown] = useState(false);

    const toggleColumnDropdown = () => setShowColumnDropdown(!showColumnDropdown);

    const handleColumnToggle = (column) => {
        setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]));
    };

    const mockData = [
        {
            'Loại sự kiện': 'Sự kiện A',
            Tên: 'Chiến dịch Xuân',
            Start: '2025-06-01',
            End: '2025-06-10',
            'Sự kiện': 'Khuyến mãi',
            'Nhóm Màn Hình': 'Nhóm 1',
            SoV: '75%',
            'Số lượt phát tối đa mỗi giờ': 10,
            'Nhận biết vị trí?': 'Có',
            'Lặp lại?': 'Không',
            'Ưu tiên?': 'Cao',
            'Tiêu chí?': 'Thời gian',
        },
        {
            'Loại sự kiện': 'Sự kiện B',
            Tên: 'Lễ hội hè',
            Start: '2025-07-01',
            End: '2025-07-05',
            'Sự kiện': 'Sự kiện đặc biệt',
            'Nhóm Màn Hình': 'Nhóm 2',
            SoV: '50%',
            'Số lượt phát tối đa mỗi giờ': 5,
            'Nhận biết vị trí?': 'Không',
            'Lặp lại?': 'Hàng năm',
            'Ưu tiên?': 'Trung bình',
            'Tiêu chí?': 'Tần suất',
        },
    ];

    const [plans, setPlans] = useState(mockData.map((item, idx) => ({ ...item, id: idx + 1 })));

    const handleDeletePlan = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa plan này?')) {
            setPlans((prev) => prev.filter((plan) => plan.id !== id));
            // Nếu dùng API thật:
            // fetch(`/api/plans/${id}`, { method: 'DELETE' })
            //   .then(() => ...)
        }
    };

    const sortedVisibleColumns = fixedColumnOrder.filter((col) => visibleColumns.includes(col));

    return (
        <div className={cx('plan')}>
            <div className={cx('header')}>
                <h2>Lên lịch</h2>
                <div className={cx('actions')}>
                    <button className={cx('sync-button')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add-button')} onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Add Event
                    </button>
                </div>
            </div>
            <div className={cx('filter-container')}>
                <div className={cx('filter-item')}>
                    <label>Khoảng thời gian</label>
                    <select value={rangeOption} onChange={(e) => setRangeOption(e.target.value)}>
                        <option>Chọn phạm vi</option>
                        <option>Hôm nay</option>
                        <option>Tuần này</option>
                        <option>Tháng này</option>
                        <option>Hôm qua</option>
                        <option>Tuần trước</option>
                        <option>Năm nay</option>
                    </select>
                </div>
                {rangeOption === 'Chọn phạm vi' && (
                    <>
                        <div className={cx('filter-item')}>
                            <label>Từ ngày</label>
                            <input type="date" />
                        </div>
                        <div className={cx('filter-item')}>
                            <label>Đến ngày</label>
                            <input type="date" />
                        </div>
                    </>
                )}
                <div className={cx('filter-item')}>
                    <label>Tên</label>
                    <input type="text" placeholder="Tên" />
                </div>
                <div className={cx('filter-item')}>
                    <label>Loại sự kiện</label>
                    <select>
                        <option>All</option>
                        <option>Bố cục</option>
                        <option>Lệnh</option>
                        <option>Bố cục chồng</option>
                        <option>Bố cục gián đoạn</option>
                        <option>Đợt phát</option>
                        <option>Action</option>
                        <option>Video/Image</option>
                        <option>Danh sách phát</option>
                        <option>Kết nối dữ liệu</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Bố cục / Đợt phát</label>
                    <select>
                        <option>Bố cục / Đợt phát</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Màn hình</label>
                    <input type="text" placeholder="Màn hình" />
                </div>
                <div className={cx('checkbox-group')}>
                    <label>Lên lịch trực tiếp?</label>
                    <input type="checkbox" />
                    <label>Lịch chia sẻ?</label>
                    <input type="checkbox" />
                </div>
                <div className={cx('filter-item')}>
                    <label>Nhận biết vị trí?</label>
                    <select>
                        <option>Cả hai</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Lặp lại?</label>
                    <select>
                        <option>Both</option>
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
                            <button onClick={toggleColumnDropdown}>Chọn cột hiển thị</button>
                            {showColumnDropdown && (
                                <ul className={cx('dropdown-menu')}>
                                    {fixedColumnOrder.map((col, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleColumnToggle(col)}
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
                            {sortedVisibleColumns.map((col, index) => (
                                <th key={index}>{col}</th>
                            ))}
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map((row, rowIndex) => (
                            <tr key={row.id}>
                                {sortedVisibleColumns.map((col, colIndex) => (
                                    <td key={colIndex}>{row[col]}</td>
                                ))}
                                <td>
                                    <button
                                        className={cx('delete-button')}
                                        title="Xóa plan"
                                        onClick={() => handleDeletePlan(row.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={cx('table-footer')}>
                    Hiển thị 0 đến 0 trong tổng số 0 mục
                    <div className={cx('pagination')}>
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
                            <h3>Schedule Event</h3>
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
                            <div className={cx('form-group')}>
                                <label>Loại sự kiện</label>
                                <select>
                                    <option>Bố cục</option>
                                    <option>Lệnh</option>
                                    <option>Bố cục chồng</option>
                                    <option>Bố cục gián đoạn</option>
                                    <option>Đợt phát</option>
                                    <option>Action</option>
                                    <option>Video/Image</option>
                                    <option>Danh sách phát</option>
                                    <option>Kết nối dữ liệu</option>
                                </select>
                                <small>Chọn loại sự kiện để lên lịch</small>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Màn hình</label>
                                <input type="text" />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Khung giờ phát</label>
                                <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
                                    <option value="Always">Always</option>
                                    <option value="Custom">Custom</option>
                                </select>
                                <small>
                                    Chọn loại khung giờ phát cho sự kiện này. Thiết lập thời gian chạy chọn "Tùy chỉnh",
                                    để sự kiện chạy liên tục chọn "Luôn luôn".
                                </small>
                            </div>

                            {timeFrame === 'Custom' && (
                                <>
                                    <div className={cx('form-group', 'checkbox')}>
                                        <input type="checkbox" />
                                        <label>Sử dụng thời gian tương đối?</label>
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
                                </>
                            )}

                            <div className={cx('form-group')}>
                                <label>Bố cục</label>
                                <select>
                                    <option>Chọn bố cục</option>
                                </select>
                                <small>Vui lòng chọn một Bố cục để hiển thị cho Sự kiện này.</small>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Thứ tự hiển thị</label>
                                <input type="number" />
                                <small>Chọn thứ tự hiển thị cho sự kiện này.</small>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Ưu tiên</label>
                                <input type="number" />
                                <small>Thiết lập mức độ ưu tiên cho sự kiện.</small>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Số lượng phát tối đa mỗi giờ</label>
                                <input type="number" defaultValue={0} />
                                <small>Giới hạn số lần phát mỗi giờ trên mỗi thiết bị.</small>
                            </div>
                            <div className={cx('form-group', 'choose-time')}>
                                <label>
                                    Chạy theo giờ CMS
                                    <input type="checkbox" />
                                </label>
                                <small>
                                    Khi được chọn, sự kiện sẽ chạy theo múi giờ cấu hình trong CMS. Nếu không, sự kiện
                                    sẽ chạy theo giờ địa phương của thiết bị hiển thị.
                                </small>
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

export default Plan;
