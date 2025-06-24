import classNames from 'classnames/bind';
import styles from './Campaign.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSync, faPlus, faTrash, faTimes, faShare, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useCampaigns, useContentList, useDeleteCampaign, useUploadCampaign } from '~/api/queries/campaignQueries';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const allColumns = [
    'Tên',
    'Thể loại',
    'Ngày bắt đầu',
    'Ngày kết thúc',
    '# Bố cục',
    'Nhãn',
    'Thời lượng',
    'Phát lại theo chu kỳ',
    'Số lần phát',
    'Mục tiêu',
    'Thứ tự phát trong danh sách',
];

function Campaign() {
    const [visibleColumns, setVisibleColumns] = useState([
        'Tên',
        'Thể loại',
        'Ngày bắt đầu',
        'Ngày kết thúc',
        'Nhãn',
        'Thời lượng',
        'Phát lại theo chu kỳ',
        'Số lần phát',
        'Mục tiêu',
    ]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showTidyModal, setShowTidyModal] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copyIcon, setCopyIcon] = useState(faCopy);

    const typeOptions = [
        { value: 'layout_list', label: 'Danh sách bố cục' },
        { value: 'ad_campaign', label: 'Đợt phát quảng cáo' },
    ];

    const orderOptions = [
        { value: 'round_robin', label: 'Xoay vòng' },
        { value: 'sequential', label: 'Chặn' },
    ];

    const frequencyOptions = [
        { value: 'once', label: 'Phát một lần' },
        { value: 'daily', label: 'Phát hàng ngày' },
        { value: 'weekly', label: 'Phát hàng tuần' },
        { value: 'monthly', label: 'Phát hàng tháng' },
    ];

    const [uiFilters, setUiFilters] = useState({
        name: '',
        content: '',
        _id: '',
        type: '',
        frequency: '',
    });

    // Handler cho việc thay đổi giá trị filter
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

    const { data, isLoading, isError, error, refetch } = useCampaigns();
    const deleteCampaignMutation = useDeleteCampaign();

    const handleRefresh = () => {
        setSelectedRows([]);
        setAllSelected(false);
        setUiFilters({ name: '', content: '', _id: '', type: '', frequency: '' }); // reset nếu muốn
        refetch(); // gọi lại API
    };

    const campaigns = useMemo(
        () =>
            data?.data?.campaigns.map((campaign) => ({
                Tên: campaign.name,
                ID: campaign._id,
                'Thể loại': typeOptions.find((opt) => opt.value === campaign.type)?.label || '',
                'Ngày bắt đầu': campaign?.schedule?.startDate
                    ? dayjs(campaign.schedule.startDate).format('DD/MM/YYYY HH:mm:ss')
                    : '',
                'Ngày kết thúc': campaign?.schedule?.endDate
                    ? dayjs(campaign.schedule.endDate).format('DD/MM/YYYY HH:mm:ss')
                    : '',
                '# Bố cục': campaign._id,
                Nhãn:
                    campaign.contents?.length > 0 ? campaign.contents.map((item) => item.content.name).join(', ') : '',
                'Thời lượng':
                    campaign.contents?.length > 0
                        ? campaign.contents.reduce((sum, item) => sum + (item.duration || 0), 0)
                        : 0,
                'Phát lại theo chu kỳ':
                    frequencyOptions.find((opt) => opt.value === campaign.schedule.frequency)?.label || '',
                'Số lần phát': campaign.priority,
                'Thứ tự phát trong danh sách':
                    orderOptions.find((opt) => opt.value === campaign.playOrder)?.label || '',
                'Mục tiêu': campaign.description,
                Phát: '',
                'Lượt hiển thị': '',
            })) || [],
        [data],
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
            const allIndexes = campaigns.map((_, index) => index);
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

    const URLContentModal = () => {
        const getContentListMutation = useContentList();
        const uploadCampaignMutation = useUploadCampaign();
        const {
            register,
            handleSubmit,
            control,
            formState: { errors },
        } = useForm({
            defaultValues: {
                url: '',
                name: '',
                enableStats: 'Không',
                labels: [],
                startDate: '',
                endDate: '',
                frequency: 'daily',
                playOrder: '',
                priority: 0,
            },
        });

        const onSubmit = async (formData) => {
            try {
                const payload = {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description, // giống tên ở ví dụ của bạn
                    playOrder: formData.playOrder,
                    contents: formData.labels.map((item, idx) => ({
                        contentId: item.value, // nếu react-select dùng content._id làm value
                        order: idx,
                        duration: 1, // mặc định hoặc cho chọn thêm trong form
                    })),
                    schedule: {
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        frequency: formData.frequency,
                        timeSlots: [
                            {
                                dayOfWeek: 1,
                                startTime: '00:00',
                                endTime: '12:00',
                            },
                        ],
                    },
                    isActive: true,
                    priority: formData.priority || 0,
                    assignedScreens: formData.assignedScreens || [],
                };
                const result = await uploadCampaignMutation.mutateAsync(payload);
                if (result.status === 'success') {
                    toast.success('Tạo đợi phát thành công!');
                }
                setShowUrlModal(false);
            } catch (err) {
                console.error('Error uploading campaign:', err);
                toast.error('Tạo đợi phát thất bại!');
            }
        };

        if (!showUrlModal) return null;

        return (
            <>
                <div className={cx('modal')}>
                    <div className={cx('modal-overlay')} onClick={() => setShowUrlModal(false)} />
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm Đợt Phát</h3>
                            <button className={cx('close')} onClick={() => setShowUrlModal(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className={cx('url-modal-body')}>
                            <div className={cx('modal-body')}>
                                <div className={cx('form-group')}>
                                    <label>Thể loại</label>
                                    <select {...register('type')}>
                                        <option value="">Chọn thể loại</option>
                                        {typeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <small>Bạn muốn tạo loại đợt phát nào?</small>
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Tên</label>
                                    <input type="text" placeholder="Nhập tên đợt phát" {...register('name')} />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Mục tiêu</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập mục tiêu đợt phát"
                                        {...register('description')}
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Nhãn</label>
                                    <Controller
                                        control={control}
                                        name="labels"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                isMulti
                                                options={getContentListMutation?.data?.data?.contents?.map((item) => ({
                                                    value: item._id,
                                                    label: item.name,
                                                }))}
                                                placeholder="Chọn một hoặc nhiều nhãn"
                                                classNamePrefix="react-select"
                                            />
                                        )}
                                    />
                                    <small>
                                        Nhãn cho đợt phát này - Chọn một hoặc nhiều nội dung làm nhãn từ danh sách.
                                    </small>
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Thứ tự phát trong danh sách</label>
                                    <select {...register('playOrder')}>
                                        <option value="">Chọn thứ tự phát</option>
                                        {orderOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <small>
                                        Khi đợt phát này được lên lịch cùng với một đợt phát khác có cùng thứ tự hiển
                                        thị, thì các bố cục của cả hai chiến dịch sẽ được sắp xếp theo thứ tự như thế
                                        nào?
                                    </small>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày bắt đầu</label>
                                    <input type="datetime-local" {...register('startDate')} />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Ngày kết thúc</label>
                                    <input type="datetime-local" {...register('endDate')} />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Phát lại theo chu kỳ</label>
                                    <select {...register('frequency')}>
                                        <option value="daily">Hàng ngày</option>
                                        <option value="weekly">Hàng tuần</option>
                                        <option value="monthly">Hàng tháng</option>
                                        <option value="once">Một lần</option>
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Số lần phát</label>
                                    <input type="number" min={0} {...register('priority', { valueAsNumber: true })} />
                                </div>
                            </div>

                            <div className={cx('modal-footer')}>
                                <button className={cx('cancel')} onClick={() => setShowUrlModal(false)}>
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
                    const campaignId = campaigns[idx].ID;
                    return deleteCampaignMutation.mutateAsync(campaignId);
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
                                disabled={deleteCampaignMutation.isPending}
                            >
                                Hủy
                            </button>
                            <button
                                className={cx('confirm')}
                                onClick={handleConfirm}
                                disabled={deleteCampaignMutation.isPending || selectedRows.length === 0}
                            >
                                {deleteCampaignMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredCampaigns = campaigns.filter(
        (campaign) => {
            const nameMatch = campaign['Tên'].toLowerCase().includes(uiFilters.name.toLowerCase());
            const labelMatch = campaign['Nhãn'].toLowerCase().includes(uiFilters.content.toLowerCase());
            const idMatch = campaign['# Bố cục'].toLowerCase().includes(uiFilters._id.toLowerCase());
            const typeMatch = uiFilters.type
                ? campaign['Thể loại'] === typeOptions.find((t) => t.value === uiFilters.type)?.label
                : true;
            const frequencyMatch = uiFilters.frequency
                ? campaign['Phát lại theo chu kỳ'] ===
                  frequencyOptions.find((f) => f.value === uiFilters.frequency)?.label
                : true;

            return nameMatch && labelMatch && idMatch && typeMatch && frequencyMatch;
        },
        [campaigns, uiFilters],
    );

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

    const paginatedCampaigns = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredCampaigns.slice(start, end);
    }, [filteredCampaigns, currentPage, itemsPerPage]);

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
        <div className={cx('campaign')}>
            <div className={cx('header')}>
                <h2>Đợt phát</h2>
                <div className={cx('actions')}>
                    <button
                        className={cx('refresh', { spinning: isLoading })}
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title="Làm mới danh sách"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add')} onClick={() => setShowUrlModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm đợt phát
                    </button>
                    <button className={cx('clean')} onClick={() => setShowTidyModal(true)}>
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa đợi phát
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" name="name" value={uiFilters.name} onChange={handleFilterChange} />
                </div>
                <div className={cx('filter-group')}>
                    <label>Nhãn</label>
                    <input type="text" name="content" value={uiFilters.content} onChange={handleFilterChange} />
                </div>
                <div className={cx('filter-group')}>
                    <label>ID bố cục</label>
                    <input type="text" name="_id" value={uiFilters._id} onChange={handleFilterChange} />
                </div>
                <div className={cx('filter-group')}>
                    <label>Thể loại</label>
                    <select name="type" value={uiFilters.type} onChange={handleFilterChange}>
                        <option></option>
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>Phát lại theo chu kỳ</label>
                    <select name="frequency" value={uiFilters.frequency} onChange={handleFilterChange}>
                        <option></option>
                        {frequencyOptions.map((option) => (
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
                                    {/*<th>Xóa</th>*/}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCampaigns.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        onClick={() => handleRowClick(rowIdx)}
                                        className={cx({ selected: selectedRows.includes(rowIdx) })}
                                    >
                                        {visibleColumns.map((col, colIdx) => (
                                            <td key={colIdx}>{row[col]}</td>
                                        ))}
                                        {/*<td>
                                            <button
                                                className={cx('delete-button')}
                                                title="Xóa campaign"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCampaign(row.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>*/}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                            {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of{' '}
                            {filteredCampaigns.length} entries
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

            <URLContentModal />
            <TidyModal />
            <ShareModal />
        </div>
    );
}

export default Campaign;
