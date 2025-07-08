import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames/bind';
import styles from './PlayContent.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContents, useDeleteContent, useUploadContent, useUploadContentText } from '~/api/queries/contentQueries';
import {
    faCheck,
    faCopy,
    faFileUpload,
    faLink,
    faPlay,
    faPlus,
    faShare,
    faSync,
    faTimes,
    faTrash,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash/debounce';
import { usePermission } from '~/hooks/usePermission';
import { PERMISSIONS } from '~/constants/permissions';

const cx = classNames.bind(styles);

const allColumns = ['ID', 'Tên', 'Thể loại', 'Tag', 'Ảnh', 'Thời lượng', 'Kích cỡ', 'Chủ sở hữu'];

function PlayContent() {
    const { hasPermission } = usePermission([PERMISSIONS.PLAY]);

    const fileInputRef = useRef(null);
    const [visibleColumns, setVisibleColumns] = useState(['Tên', 'Thể loại', 'Thời lượng']);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showTidyModal, setShowTidyModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [urlForm, setUrlForm] = useState({
        url: '',
        name: '',
        enableStats: 'Không',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [duration, setDuration] = useState(2); // Default duration for images
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [copyIcon, setCopyIcon] = useState(faCopy);

    const [uiFilters, setUiFilters] = useState({
        _id: '',
        name: '',
        type: '',
        isActive: '',
    });

    const [queryFilters, setQueryFilters] = useState({
        _id: '',
        name: '',
        type: '',
        isActive: '',
    });

    // Sử dụng queryFilters thay vì filters cho useContents
    const { data, isLoading, isError, error, refetch } = useContents(queryFilters);
    const uploadContentMutation = useUploadContent();
    const uploadContentTextMutation = useUploadContentText();
    const deleteContentMutation = useDeleteContent();

    // Tạo debounced function để cập nhật query filters
    const debouncedSetQueryFilters = useMemo(
        () =>
            debounce((filters) => {
                setQueryFilters(filters);
            }, 500),
        [],
    );

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

            // Đối với select boxes, cập nhật query ngay lập tức
            if (name === 'type' || name === 'isActive') {
                setQueryFilters(newFilters);
            }
            // Đối với input text, sử dụng debounce
            else {
                debouncedSetQueryFilters(newFilters);
            }
        },
        [uiFilters, debouncedSetQueryFilters],
    );

    const contents = useMemo(
        () =>
            data?.data?.contents.map((content) => ({
                ID: content._id,
                Tên: content.name,
                'Thể loại': content.type,
                Tag: '',
                Ảnh: content.url,
                'Thời lượng': content.duration || '00:00:00',
                'Kích cỡ': content.metadata?.size || '',
                'Chủ sở hữu': content.createdBy?.username || '',
            })) || [],
        [data],
    );

    // Replace handleRefresh with refetch from useQuery
    const handleRefresh = () => {
        refetch();
    };

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
            const allIndexes = contents.map((_, index) => index);
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

    const getMediaDuration = (file) => {
        return new Promise((resolve) => {
            // Xử lý cho video và audio
            if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
                media.preload = 'metadata';

                media.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(media.src);
                    resolve(Math.round(media.duration));
                };

                media.src = URL.createObjectURL(file);
            } else {
                // Với ảnh và các file khác, dùng duration mặc định
                resolve(2);
            }
        });
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const mediaDuration = await getMediaDuration(file);
            setDuration(mediaDuration);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            const mediaDuration = await getMediaDuration(file);
            setDuration(mediaDuration);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Update handleUpload to use mutation
    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Vui lòng chọn file để tải lên');
            return;
        }

        try {
            setIsUploading(true);
            setUploadError(null);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', selectedFile.name);
            formData.append('type', selectedFile.type.split('/')[0]);
            formData.append('duration', duration.toString());

            await uploadContentMutation.mutateAsync(formData);
            setShowAddContentModal(false);
            setSelectedFile(null);
            setDuration(2);
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lên file');
        } finally {
            setIsUploading(false);
        }
    };

    const AddContentModal = () => {
        if (!showAddContentModal) return null;

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('modal')}>
                    <div className={cx('modal-header')}>
                        <h2>Thêm Nội dung</h2>
                        <button className={cx('close-button')} onClick={() => setShowAddContentModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx('modal-body')}>
                        <div
                            className={cx('upload-area', { 'has-file': selectedFile })}
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <FontAwesomeIcon icon={faFileUpload} className={cx('upload-icon')} />
                            {selectedFile ? (
                                <p>File đã chọn: {selectedFile.name}</p>
                            ) : (
                                <>
                                    <p>Kéo và thả tệp vào đây hoặc click để chọn tệp</p>
                                    <p className={cx('file-size-limit')}>Biểu mẫu này chấp nhận tệp tối đa 2G</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {uploadError && <div className={cx('error-message')}>{uploadError}</div>}
                        <div className={cx('buttons-group')}>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !selectedFile}
                                className={cx('upload-button')}
                            >
                                <FontAwesomeIcon icon={faUpload} />
                                {isUploading ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
                            </button>
                            <button
                                className={cx('cancel')}
                                onClick={() => {
                                    setSelectedFile(null);
                                    setShowAddContentModal(false);
                                }}
                                disabled={isUploading}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                Hủy tải lên
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const URLContentModal = () => {
        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm({
            defaultValues: {
                url: '',
                name: '',
                enableStats: 'Không',
            },
        });

        const onSubmit = (data) => {
            console.log('Form submitted:', data);

            uploadContentTextMutation.mutate({
                name: data.name,
                content: data.url,
            }, {
                onSuccess: () => {
                    console.log('Content added successfully');
                    setShowUrlModal(false);
                },
                onError: (error) => {
                    console.error('Error adding content:', error);
                },
            });
        };

        if (!showUrlModal) return null;

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('url-modal')}>
                    <div className={cx('url-modal-header')}>
                        <h2>Thêm Nội Dung qua URL</h2>
                        <button className={cx('close-button')} onClick={() => setShowUrlModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className={cx('url-modal-body')}>
                        <div className={cx('form-group')}>
                            <label>URL</label>
                            <input
                                type="text"
                                {...register('url', { required: 'URL là bắt buộc' })}
                                placeholder="Vui lòng nhập URL của tệp cần lấy từ xa"
                                className={cx('form-input')}
                            />
                            {errors.url && <p className={cx('error-message')}>{errors.url.message}</p>}
                            <p className={cx('help-text')}>Biểu mẫu này chấp nhận tệp tối đa 2G</p>
                        </div>
                        <div className={cx('form-group')}>
                            <label>Tên</label>
                            <input
                                type="text"
                                {...register('name')}
                                placeholder="Tên Nội Dung tùy chọn, nếu để trống mặc định sẽ là tên tệp"
                                className={cx('form-input')}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Bật tính năng thống kê phát cho nội dung này?</label>
                            <select {...register('enableStats')} className={cx('form-select')}>
                                <option value="Không">Không</option>
                                <option value="Có">Có</option>
                            </select>
                            <p className={cx('help-text')}>
                                Enable the collection of Proof of Play statistics for this Media Item. Ensure that
                                'Enable Stats Collection' is set to 'On' in the Display Settings.
                            </p>
                        </div>
                        <div className={cx('url-modal-footer')}>
                            <button type="button" className={cx('cancel')} onClick={() => setShowUrlModal(false)}>
                                Hủy
                            </button>
                            <button type="submit" className={cx('save')}>
                                Lưu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const TidyModal = () => {
        if (!showTidyModal) return null;

        const handleConfirm = async () => {
            try {
                setDeleteError(null);
                const promises = selectedRows.map((idx) => {
                    const contentId = contents[idx].ID;
                    return deleteContentMutation.mutateAsync(contentId);
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
                            disabled={deleteContentMutation.isPending}
                        >
                            Hủy
                        </button>
                        <button
                            className={cx('confirm')}
                            onClick={handleConfirm}
                            disabled={deleteContentMutation.isPending || selectedRows.length === 0}
                        >
                            {deleteContentMutation.isPending ? 'Đang xóa...' : 'Xóa'}
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

    const handlePlay = () => {
        if (selectedRows.length === 0) {
            alert('Vui lòng chọn ít nhất một nội dung để phát');
            return;
        }

        const selectedContents = selectedRows.map((idx) => {
            const content = contents[idx];
            console.log('%c 1 --> Line: 496||index.js\n content: ', 'color:#f0f;', content);
            return {
                id: content.ID,
                name: content.Tên,
                url: (content['Thể loại'].toLowerCase() !== 'text') ? `http://localhost:3001/uploads/${content.Ảnh}` : content.Ảnh,
                type: content['Thể loại'].toLowerCase(),
                duration: content['Thời lượng'],
            };
        });

        // Mã hóa dữ liệu để truyền qua URL
        const encodedPlaylist = encodeURIComponent(JSON.stringify(selectedContents));

        // Cấu hình cho cửa sổ mới
        const width = 800;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        // Mở cửa sổ mới với vị trí và kích thước được định nghĩa
        window.open(
            `/play?playlist=${encodedPlaylist}`,
            'PlayWindow',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );
    };

    return (
        <div className={cx('play-content')}>
            <div className={cx('header')}>
                <h2>Thư viện</h2>
                <div className={cx('actions')}>
                    {hasPermission && (
                        <button className={cx('play')} onClick={handlePlay} disabled={selectedRows.length === 0}>
                            <FontAwesomeIcon icon={faPlay} /> Phát
                        </button>
                    )}
                    <button className={cx('add')} onClick={() => setShowAddContentModal(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Nội dung
                    </button>
                    <button className={cx('add-url')} onClick={() => setShowUrlModal(true)}>
                        <FontAwesomeIcon icon={faLink} />
                        Thêm nội dung (URL)
                    </button>
                    <button className={cx('clean')} onClick={() => setShowTidyModal(true)}>
                        <FontAwesomeIcon icon={faTrash} />
                        Tidy Library
                    </button>
                    <button className={cx('refresh')} onClick={handleRefresh} disabled={isLoading}>
                        <FontAwesomeIcon icon={faSync} spin={isLoading} />
                    </button>
                </div>
            </div>

            {isError && <div className={cx('error-message')}>{error?.message || 'Có lỗi xảy ra khi tải dữ liệu'}</div>}

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>ID</label>
                    <input type="text" name="_id" value={uiFilters._id} onChange={handleFilterChange} />
                </div>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" name="name" value={uiFilters.name} onChange={handleFilterChange} />
                </div>
                <div className={cx('filter-group')}>
                    <label>Thể loại</label>
                    <select name="type" value={uiFilters.type} onChange={handleFilterChange}>
                        <option value="">Tất cả</option>
                        <option value="image">Ảnh</option>
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>Ngưng sử dụng</label>
                    <select name="isActive" value={uiFilters.isActive} onChange={handleFilterChange}>
                        <option value="">Tất cả</option>
                        <option value="true">Không</option>
                        <option value="false">Có</option>
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
                                {contents.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        onClick={() => handleRowClick(rowIdx)}
                                        className={cx({ selected: selectedRows.includes(rowIdx) })}
                                    >
                                        {visibleColumns.map((col, colIdx) => (
                                            <td key={colIdx}>{row[col]}</td>
                                        ))}
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
                        <span>Showing 1 to 2 of 2 entries</span>
                    </div>
                    <div className={cx('right')}>
                        <button>Trước</button>
                        <button>Tiếp</button>
                    </div>
                </div>
            </div>
            <AddContentModal />
            <URLContentModal />
            <TidyModal />
            <ShareModal />
        </div>
    );
}

export default PlayContent;
