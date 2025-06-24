import classNames from 'classnames/bind';
import styles from './Plan.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faPlus, faXmark, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons';
import { usePlans } from '~/api/queries/planQueries';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';

const cx = classNames.bind(styles);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

function Plan() {
    const [timeFrame, setTimeFrame] = useState('Always');

    const typeOptions = [
        { value: 'layout_list', label: 'Danh sách bố cục' },
        { value: 'ad_campaign', label: 'Đợt phát quảng cáo' },
    ];
    const repeat = [
        { value: 'always', label: 'Luôn luôn' },
        { value: 'custom', label: 'Tùy chỉnh' },
    ];
    const allColumns = [
        'ID',
        'Loại sự kiện',
        'Tên',
        'Start',
        'End',
        'Sự kiện',
        'ID Đợt phát',
        'SoV',
        'Số lượt phát tối đa mỗi giờ',
        'Nhận biết vị trí?',
        'Lặp lại?',
        'Thứ tự',
        'Ưu tiên',
        'Tiêu chí',
        'Chạy theo giờ CMS?',
        'Lên lịch trực tiếp?',
        'Lịch chia sẻ?',
    ];

    const [visibleColumns, setVisibleColumns] = useState([
        'ID',
        'Loại sự kiện',
        'Tên',
        'Start',
        'End',
        'Sự kiện',
        'ID Đợt phát',
        'SoV',
        'Số lượt phát tối đa mỗi giờ',
        'Nhận biết vị trí?',
        'Lặp lại?',
        'Ưu tiên',
        'Tiêu chí?',
    ]);

    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showTidyModal, setShowTidyModal] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copyIcon, setCopyIcon] = useState(faCopy);
    const [rangeOption, setRangeOption] = useState(faCopy);

    const toggleColumnDropdown = () => setShowColumnDropdown(!showColumnDropdown);

    const handleColumnToggle = (column) => {
        setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]));
    };

    const handleTimePeriodChange = (value) => {
        setRangeOption(value); // để cập nhật UI

        let from = '';
        let to = '';

        switch (value) {
            case 'Hôm nay':
                from = dayjs().startOf('day').format('YYYY-MM-DD');
                to = dayjs().endOf('day').format('YYYY-MM-DD');
                break;
            case 'Hôm qua':
                from = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
                to = dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD');
                break;
            case 'Tuần này':
                from = dayjs().startOf('week').format('YYYY-MM-DD');
                to = dayjs().endOf('week').format('YYYY-MM-DD');
                break;
            case 'Tuần trước':
                from = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                to = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
                break;
            case 'Tháng này':
                from = dayjs().startOf('month').format('YYYY-MM-DD');
                to = dayjs().endOf('month').format('YYYY-MM-DD');
                break;
            case 'Năm nay':
                from = dayjs().startOf('year').format('YYYY-MM-DD');
                to = dayjs().endOf('year').format('YYYY-MM-DD');
                break;
            default:
                from = '';
                to = '';
        }

        setUiFilters((prev) => ({
            ...prev,
            start: from,
            end: to,
        }));
    };

    const [uiFilters, setUiFilters] = useState({
        timePeriod: 'Chọn phạm vi',
        _id: '',
        start: '',
        end: '',
        name: '',
        eventType: '',
        typeOptions: '',
        sharedSchedule: 'No',
        directSchedule: 'No',
        locationAware: 'Yes',
        repeatOp: '',
    });

    const { data, isLoading, isError, error, refetch } = usePlans();

    const handleRefresh = () => {
        setSelectedRows([]);
        setAllSelected(false);
        setUiFilters({
            timePeriod: 'Chọn phạm vi',
            _id: '',
            start: '',
            end: '',
            name: '',
            eventType: '',
            typeOptions: '',
            sharedSchedule: 'No',
            directSchedule: 'No',
            locationAware: 'Yes',
            repeatOp: '',
        }); // reset nếu muốn
        refetch(); // gọi lại API
    };

    const plans = useMemo(
        () =>
            data?.data?.plans.map((plan) => ({
                ID: plan._id,
                Tên: plan.name,
                'Loại sự kiện': plan.eventType,
                Start: plan.start ? dayjs(plan.start).format('DD/MM/YYYY HH:mm:ss') : '',
                Start_search: plan.start,
                End: plan.end ? dayjs(plan.end).format('DD/MM/YYYY HH:mm:ss') : '',
                'Sự kiện': plan.event,
                'ID Đợt phát': plan.campaigns?.length > 0 ? plan.campaigns.map((item) => item.campaign).join(', ') : '',
                SoV: plan.sov,
                'Số lượt phát tối đa mỗi giờ': plan.maxPlaysPerHour,
                'Nhận biết vị trí?': plan.locationAware ? 'Yes' : 'No',
                'Lặp lại?': repeat.find((opt) => opt.value === plan.repeat)?.label || '',
                'Lặp lại type': plan.repeat,
                'Thứ tự': plan.order,
                'Ưu tiên': plan.priority,
                'Chạy theo giờ CMS?': plan.cmsTime ? 'Yes' : 'No',
                'Lên lịch trực tiếp?': plan.directSchedule ? 'Yes' : 'No',
                'Lịch chia sẻ?': plan.sharedSchedule ? 'Yes' : 'No',
            })) || [],
        [data],
    );

    const filteredPlans = plans.filter(
        (plan) => {
            const nameMatch = plan['Tên'].toLowerCase().includes(uiFilters.name.toLowerCase());
            const idMatch = plan['ID'].toLowerCase().includes(uiFilters._id.toLowerCase());
            const eventTypeMatch = plan['Loại sự kiện'].toLowerCase().includes(uiFilters.eventType.toLowerCase());
            const typeOptionsMatch = plan['ID Đợt phát'].toLowerCase().includes(uiFilters.typeOptions.toLowerCase());
            const sharedScheduleMatch = plan['Lịch chia sẻ?']
                .toLowerCase()
                .includes(uiFilters.sharedSchedule.toLowerCase());
            const directScheduleMatch = plan['Lên lịch trực tiếp?']
                .toLowerCase()
                .includes(uiFilters.directSchedule.toLowerCase());
            const locationAwareMatch = plan['Nhận biết vị trí?']
                .toLowerCase()
                .includes(uiFilters.locationAware.toLowerCase());
            const repeatMatch = plan['Lặp lại type'].toLowerCase().includes(uiFilters.repeatOp.toLowerCase());
            // const timePeriodMatch = plan['Start'].toLowerCase().includes(uiFilters.timePeriod.toLowerCase());

            const from = uiFilters.start ? dayjs(uiFilters.start) : null;
            const to = uiFilters.end ? dayjs(uiFilters.end) : null;

            const planStart = plan['Start_search'] ? dayjs(plan['Start_search'], 'DD/MM/YYYY HH:mm:ss') : null;

            const dateMatch = (!from || planStart.isSameOrAfter(from)) && (!to || planStart.isSameOrBefore(to));
            return (
                nameMatch &&
                idMatch &&
                eventTypeMatch &&
                typeOptionsMatch &&
                sharedScheduleMatch &&
                directScheduleMatch &&
                locationAwareMatch &&
                repeatMatch &&
                dateMatch
            );
        },
        [plans, uiFilters],
    );

    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

    const paginatedPlans = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredPlans.slice(start, end);
    }, [filteredPlans, currentPage, itemsPerPage]);

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
            const allIndexes = plans.map((_, index) => index);
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
                    <select
                        name="timePeriod"
                        value={rangeOption}
                        onChange={(e) => handleTimePeriodChange(e.target.value)}
                    >
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
                            <input type="date" name="start" value={uiFilters.start} onChange={handleFilterChange} />
                        </div>
                        <div className={cx('filter-item')}>
                            <label>Đến ngày</label>
                            <input type="date" name="end" value={uiFilters.end} onChange={handleFilterChange} />
                        </div>
                    </>
                )}
                <div className={cx('filter-item')}>
                    <label>Tên</label>
                    <input
                        type="text"
                        placeholder="Tên"
                        name="name"
                        value={uiFilters.name}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className={cx('filter-item')}>
                    <label>Loại sự kiện</label>
                    <select name="eventType" value={uiFilters.eventType} onChange={handleFilterChange}>
                        <option></option>
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
                {/* <div className={cx('filter-item')}>
                    <label>Bố cục / Đợt phát</label>
                    <select name="typeOptions" value={uiFilters.typeOptions} onChange={handleFilterChange}>
                        <option></option>
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div> */}
                <div className={cx('filter-item')}>
                    <label>Lên lịch trực tiếp?</label>
                    <select name="directSchedule" value={uiFilters.directSchedule} onChange={handleFilterChange}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Lịch chia sẻ?</label>
                    <select name="sharedSchedule" value={uiFilters.sharedSchedule} onChange={handleFilterChange}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Nhận biết vị trí?</label>
                    <select name="locationAware" value={uiFilters.locationAware} onChange={handleFilterChange}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
                <div className={cx('filter-item')}>
                    <label>Lặp lại?</label>
                    <select name="repeatOp" value={uiFilters.repeatOp} onChange={handleFilterChange}>
                        <option></option>
                        {repeat.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={cx('table-container')}>
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
                            <button onClick={toggleColumnDropdown}>Chọn cột hiển thị</button>
                            {showColumnDropdown && (
                                <ul className={cx('dropdown-menu')}>
                                    {allColumns.map((col, index) => (
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
                <div className={cx('table-main')}>
                    <div className={cx('schedule-table-wrapper')}>
                        <table className={cx('schedule-table')}>
                            <thead>
                                <tr>
                                    {visibleColumns.map((col, index) => (
                                        <th key={index}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {plans.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length + 1} className={cx('no-data')}>
                                            No data available in table
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPlans.map((row, rowIdx) => (
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
                            {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of {filteredPlans.length}{' '}
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
                                    <option value="always">Always</option>
                                    <option value="custom">Custom</option>
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
