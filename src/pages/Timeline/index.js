// Timeline Page with Dropdown Column Selector and Add Modal UI

import classNames from 'classnames/bind';
import styles from './Timeline.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faXmark, faTrash, faTimes, faCopy, faCheck, faShare } from '@fortawesome/free-solid-svg-icons';
import { useDeleteTimeline, useTimelines, useUploadTimeline } from '~/api/queries/timelineQueries';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const allColumns = [
    'ID',
    'Tên',
    'Mô tả',
    'Thời gian bắt đầu',
    'Thời gian kết thúc',
    'Sử dụng thời gian tương đối',
    'Ngưng sử dụng',
];

function Timeline() {
    const [visibleColumns, setVisibleColumns] = useState([
        'Tên',
        'Mô tả',
        'Thời gian bắt đầu',
        'Thời gian kết thúc',
        'Sử dụng thời gian tương đối',
        'Ngưng sử dụng',
    ]);
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

    const [uiFilters, setUiFilters] = useState({
        name: '',
        _id: '',
        isDisabled: 'No',
    });

    const { data, isLoading, isError, error, refetch } = useTimelines();
    const deleteTimelineMutation = useDeleteTimeline();

    const handleRefresh = () => {
        setSelectedRows([]);
        setAllSelected(false);
        setUiFilters({ name: '', _id: '', isDisabled: 'No' }); // reset nếu muốn
        refetch(); // gọi lại API
    };

    const timelines = useMemo(
        () =>
            data?.data?.timelines.map((timeline) => ({
                Tên: timeline.name,
                'Mô tả': timeline.description,
                'Thời gian bắt đầu': timeline.startTime ? dayjs(timeline.startTime).format('DD/MM/YYYY HH:mm:ss') : '',
                'Thời gian kết thúc': timeline.endTime ? dayjs(timeline.endTime).format('DD/MM/YYYY HH:mm:ss') : '',
                'Sử dụng thời gian tương đối': timeline.isRelative ? 'Yes' : 'No',
                'Ngưng sử dụng': timeline.isDisabled ? 'Yes' : 'No',
                ID: timeline._id,
            })) || [],
        [data],
    );

    const filteredTimelines = timelines.filter(
        (timeline) => {
            const nameMatch = timeline['Tên'].toLowerCase().includes(uiFilters.name.toLowerCase());
            const retiredMatch = timeline['Ngưng sử dụng'].toLowerCase().includes(uiFilters.isDisabled.toLowerCase());
            const idMatch = timeline['ID'].toLowerCase().includes(uiFilters._id.toLowerCase());
            return nameMatch && retiredMatch && idMatch;
        },
        [timelines, uiFilters],
    );

    const totalPages = Math.ceil(filteredTimelines.length / itemsPerPage);

    const paginatedTimelines = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredTimelines.slice(start, end);
    }, [filteredTimelines, currentPage, itemsPerPage]);

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
            const allIndexes = timelines.map((_, index) => index);
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

    const TimelineModal = () => {
        const useUploadTimelineMutation = useUploadTimeline();
        const {
            register,
            handleSubmit,
            control,
            formState: { errors },
        } = useForm({
            defaultValues: {
                name: '',
                description: '',
                startTime: '',
                endTime: '',
                isRelative: false,
                isDisabled: false,
            },
        });

        const onSubmit = async (formData) => {
            try {
                const payload = {
                    name: formData.name,
                    description: formData.description,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    isRelative: formData.isRelative,
                    isDisabled: false,
                };
                await useUploadTimelineMutation.mutateAsync(payload);
                setShowModal(false);
            } catch (err) {
                console.error('Error uploading campaign:', err);
                toast.error('Tạo đợi phát thất bại!');
            }
        };

        if (!showModal) return null;

        return (
            <>
                <div className={cx('modal')}>
                    <div className={cx('modal-overlay')} onClick={() => setShowModal(false)} />
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm khung giờ</h3>
                            <button className={cx('close')} onClick={() => setShowModal(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className={cx('url-modal-body')}>
                            <div className={cx('modal-body')}>
                                <div className={cx('form-group')}>
                                    <label>Tên</label>
                                    <input type="text" {...register('name')} />
                                    <small>Tên cho khung giờ này</small>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Mô tả</label>
                                    <input type="text" {...register('description')} />
                                    <small>Mô tả cho khung giờ này</small>
                                </div>
                                <div className={cx('form-group', 'choose-time')}>
                                    <label>
                                        Sử dụng thời gian tương đối?
                                        <input type="checkbox" {...register('isRelative')} />
                                    </label>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Thời gian bắt đầu</label>
                                    <input type="datetime-local" {...register('startTime')} lang="vi-VN" />
                                    <small>Chọn khung thời gian bắt đầu cho sự kiện này</small>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Thời gian kết thúc</label>
                                    <input type="datetime-local" {...register('endTime')} />
                                    <small>Chọn khung thời gian kết thúc cho sự kiện này</small>
                                </div>
                            </div>

                            <div className={cx('modal-footer')}>
                                <button className={cx('cancel')} onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button className={cx('submit')}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        );
    };

    const TidyModal = () => {
        if (!showTidyModal) return null;

        const handleConfirm = async () => {
            try {
                setDeleteError(null);
                const promises = selectedRows.map((idx) => {
                    const timelinesId = timelines[idx].ID;
                    return deleteTimelineMutation.mutateAsync(timelinesId);
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
                <div className={cx('modal-overlay')} onClick={() => setShowModal(false)} />
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
                            disabled={deleteTimelineMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            className={cx('confirm')}
                            onClick={handleConfirm}
                            disabled={deleteTimelineMutation.isPending || selectedRows.length === 0}
                        >
                            {deleteTimelineMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
                setCopyIcon(faCheck);
                setTimeout(() => setCopyIcon(faCopy), 2000);
            })
            .catch(() => {
                // Xử lý lỗi nếu cần
            });
    };

    const handleFacebookShare = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    /*const handleTelegramShare = () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('Xem nội dung này trên nền tảng của chúng tôi:');
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
            };*/

    const ShareModal = () => {
        if (!showShareModal) return null;

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('share-modal')}>
                    <div className={cx('share-modal-header')}>
                        <h2>Chia sẻ</h2>
                        <button className={cx('close-button')} onClick={() => setShowShareModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx('share-modal-body')}>
                        <div className={cx('share-buttons')}>
                            <button className={cx('share-button', 'facebook')} onClick={handleFacebookShare}>
                                <FontAwesomeIcon icon={faShare} />
                                Chia sẻ qua Facebook
                            </button>
                            {/*<button className={cx('share-button', 'telegram')} onClick={handleTelegramShare}>
                                        <FontAwesomeIcon icon={faShare} />
                                        Chia sẻ qua Telegram
                                    </button>*/}
                            <button className={cx('share-button', 'copy')} onClick={handleCopyLink}>
                                <FontAwesomeIcon icon={copyIcon} />
                                Sao chép link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('timeline')}>
            <div className={cx('header')}>
                <h2>Khung giờ phát</h2>
                <div className={cx('actions')}>
                    <button
                        className={cx('refresh', { spinning: isLoading })}
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title="Làm mới danh sách"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add')} onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm khung giờ
                    </button>
                    <button className={cx('clean')} onClick={() => setShowTidyModal(true)}>
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa khung giờ
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <div className={cx('input-group')}>
                        <input type="text" name="name" value={uiFilters.name} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className={cx('filter-group')}>
                    <label>ID</label>
                    <div className={cx('input-group')}>
                        <input type="text" name="_id" value={uiFilters._id} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className={cx('filter-group')}>
                    <label>Ngưng sử dụng</label>
                    <div className={cx('input-group')}>
                        <select name="isDisabled" value={uiFilters.isDisabled} onChange={handleFilterChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
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
                        </tr>
                    </thead>
                    <tbody>
                        {timelines.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.length + 1} className={cx('no-data')}>
                                    No data available in table
                                </td>
                            </tr>
                        ) : (
                            paginatedTimelines.map((row, rowIdx) => (
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

                <div className={cx('table-footer')}>
                    <div className={cx('left')}>
                        <button className={cx('choose')} onClick={handleSelectAll}>
                            Chọn tất cả
                        </button>
                        <button className={cx('share')} onClick={handleShare}>
                            <FontAwesomeIcon icon={faShare} /> Share
                        </button>
                        <span>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, filteredTimelines.length)} of{' '}
                            {filteredTimelines.length} entries
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
            <TimelineModal />
            <TidyModal />
            <ShareModal />
        </div>
    );
}

export default Timeline;
