import { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './PlayContent.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSync,
    faFolder,
    faTrash,
    faLink,
    faChevronDown,
    faChevronRight,
    faTimes,
    faUpload,
    faFileUpload,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const allColumns = ['ID', 'Tên', 'Thể loại', 'Tag', 'Ảnh', 'Thời lượng', 'Kích cỡ', 'Chủ sở hữu'];

const mockData = [
    {
        ID: 1,
        Tên: 'xibo',
        'Thể loại': 'image',
        Tag: 'imported',
        Ảnh: '/path/to/xibo.jpg',
        'Thời lượng': '00:00:10',
        'Kích cỡ': '41.53 KiB',
        'Chủ sở hữu': 'xibo_admin',
    },
    {
        ID: 2,
        Tên: 'aurora',
        'Thể loại': 'image',
        Tag: '',
        Ảnh: '/path/to/aurora.jpg',
        'Thời lượng': '00:00:10',
        'Kích cỡ': '812.31 KiB',
        'Chủ sở hữu': 'xibo_admin',
    },
];

// Thêm cấu trúc dữ liệu thư mục
const folderStructure = [
    {
        id: 1,
        name: 'Root Folder',
        isRoot: true,
        path: 'Root Folder',
        children: [
            {
                id: 2,
                name: 'Khu 1',
                path: 'Root Folder > Khu 1',
                parent: 1,
            },
            {
                id: 3,
                name: 'Khu 2',
                path: 'Root Folder > Khu 2',
                parent: 1,
            },
        ],
    },
];

function PlayContent() {
    const [visibleColumns, setVisibleColumns] = useState(['Tên', 'Thể loại', 'Thời lượng']);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [isAllFolderChecked, setIsAllFolderChecked] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showTidyModal, setShowTidyModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState({ name: 'Root Folder', path: 'Root Folder' });
    const [folderSearchQuery, setFolderSearchQuery] = useState('');
    const [urlForm, setUrlForm] = useState({
        url: '',
        name: '',
        enableStats: 'Không',
    });
    const fileInputRef = useRef(null);
    const [setSelectedFile] = useState(null);

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
            const allIndexes = mockData.map((_, index) => index);
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

    const toggleFolder = () => {
        setExpanded(!expanded);
    };

    const handleAllFolderChange = (e) => {
        setIsAllFolderChecked(e.target.checked);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const FolderModal = () => {
        if (!showFolderModal) return null;

        const handleFolderSelect = (folder) => {
            setSelectedFolder(folder);
            setShowFolderModal(false);
        };

        // Tạo danh sách phẳng các thư mục để tìm kiếm
        const flatFolders = [folderStructure[0], ...folderStructure[0].children];

        const filteredFolders = flatFolders.filter((folder) =>
            folder.name.toLowerCase().includes(folderSearchQuery.toLowerCase()),
        );

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('folder-modal')}>
                    <div className={cx('folder-modal-header')}>
                        <h2>Chọn thư mục</h2>
                        <button className={cx('close-button')} onClick={() => setShowFolderModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx('folder-modal-body')}>
                        <div className={cx('search-box')}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm thư mục..."
                                value={folderSearchQuery}
                                onChange={(e) => setFolderSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={cx('folder-tree')}>
                            {filteredFolders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className={cx('folder-item', {
                                        selected: selectedFolder.name === folder.name,
                                    })}
                                    onClick={() => handleFolderSelect(folder)}
                                >
                                    <FontAwesomeIcon
                                        icon={faFolder}
                                        className={cx('folder-icon', { root: folder.isRoot })}
                                    />
                                    <span className={cx({ subfolder: !folder.isRoot })}>{folder.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cx('folder-modal-footer')}>
                        <button className={cx('cancel')} onClick={() => setShowFolderModal(false)}>
                            Hủy
                        </button>
                        <button className={cx('select')} onClick={() => setShowFolderModal(false)}>
                            Xong
                        </button>
                    </div>
                </div>
            </div>
        );
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
                        <div className={cx('current-folder')}>
                            <label>Thư mục hiện tại:</label>
                            <span>{selectedFolder.path}</span>
                        </div>
                        <div
                            className={cx('upload-area')}
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <FontAwesomeIcon icon={faFileUpload} className={cx('upload-icon')} />
                            <p>Kéo và thả tệp vào đây hoặc click để chọn tệp</p>
                            <p className={cx('file-size-limit')}>Biểu mẫu này chấp nhận tệp tối đa 2G</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={cx('buttons-group')}>
                            <button>
                                <FontAwesomeIcon icon={faUpload} />
                                Bắt đầu tải lên
                            </button>
                            <button className={cx('cancel')}>
                                <FontAwesomeIcon icon={faTimes} />
                                Hủy tải lên
                            </button>
                            <button onClick={() => setShowFolderModal(true)}>Chọn thư mục</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const URLContentModal = () => {
        if (!showUrlModal) return null;

        const handleUrlFormChange = (e) => {
            const { name, value } = e.target;
            setUrlForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleSubmit = () => {
            // Xử lý submit form
            console.log('URL Form Data:', urlForm);
            setShowUrlModal(false);
        };

        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('url-modal')}>
                    <div className={cx('url-modal-header')}>
                        <h2>Thêm Nội Dung qua URL</h2>
                        <button className={cx('close-button')} onClick={() => setShowUrlModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx('url-modal-body')}>
                        <div className={cx('form-group', 'folder-group')}>
                            <label>Thư mục</label>
                            <div className={cx('folder-content')}>
                                <button className={cx('folder-select-btn')} onClick={() => setShowFolderModal(true)}>
                                    Chọn thư mục
                                </button>
                                <div className={cx('folder-path')}>{selectedFolder.path}</div>
                                <div className={cx('folder-help')}>Chọn thư mục cho đợt phát này</div>
                            </div>
                        </div>
                        <div className={cx('form-group')}>
                            <label>URL</label>
                            <input
                                type="text"
                                name="url"
                                value={urlForm.url}
                                onChange={handleUrlFormChange}
                                placeholder="Vui lòng nhập URL của tệp cần lấy từ xa"
                            />
                            <p className={cx('help-text')}>Biểu mẫu này chấp nhận tệp tối đa 2G</p>
                        </div>
                        <div className={cx('form-group')}>
                            <label>Tên</label>
                            <input
                                type="text"
                                name="name"
                                value={urlForm.name}
                                onChange={handleUrlFormChange}
                                placeholder="Tên Nội Dung tùy chọn, nếu để trống mặc định sẽ là tên tệp"
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Bật tính năng thống kê phát cho nội dung này?</label>
                            <select name="enableStats" value={urlForm.enableStats} onChange={handleUrlFormChange}>
                                <option value="Không">Không</option>
                                <option value="Có">Có</option>
                            </select>
                            <p className={cx('help-text')}>
                                Enable the collection of Proof of Play statistics for this Media Item. Ensure that
                                'Enable Stats Collection' is set to 'On' in the Display Settings.
                            </p>
                        </div>
                    </div>
                    <div className={cx('url-modal-footer')}>
                        <button className={cx('cancel')} onClick={() => setShowUrlModal(false)}>
                            Hủy
                        </button>
                        <button className={cx('save')} onClick={handleSubmit}>
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const TidyModal = () => {
        if (!showTidyModal) return null;

        const handleConfirm = () => {
            // Xử lý logic dọn dẹp thư viện
            console.log('Cleaning library...');
            setShowTidyModal(false);
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
                            <div>Dọn thư viện sẽ xóa những nội dung không sử dụng.</div>
                            <div className={cx('data-info')}>
                                There is 812.31 KiB of data stored in 1 files . Are you sure you want to proceed?
                            </div>
                        </div>
                    </div>
                    <div className={cx('tidy-modal-footer')}>
                        <button className={cx('cancel')} onClick={() => setShowTidyModal(false)}>
                            Hủy
                        </button>
                        <button className={cx('confirm')} onClick={handleConfirm}>
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('play-content')}>
            <div className={cx('header')}>
                <h2>Thư viện</h2>
                <div className={cx('actions')}>
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
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>ID</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Chủ sở hữu</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Nhóm người dùng sở hữu</label>
                    <select>
                        <option></option>
                        <option>Content Manager</option>
                        <option>Display Manager</option>
                        <option>Playlist Manager</option>
                        <option>Schedule Manager</option>
                        <option>Users</option>
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>Thể loại</label>
                    <select>
                        <option></option>
                        <option>Âm thanh</option>
                        <option>Gói HTML</option>
                        <option>Ảnh</option>
                        <option>PDF</option>
                        <option>Phim</option>
                        <option>Điểm điện (PPT, PPS)</option>
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>Ngưng sử dụng</label>
                    <select>
                        <option>Không</option>
                        <option>Có</option>
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>ID bố cục</label>
                    <input type="text" />
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
                        <button>In</button>
                        <button>CSV</button>
                    </div>
                </div>

                <div className={cx('table-main')}>
                    <div className={cx('root-folder')}>
                        <input type="text" placeholder="Tìm Kiếm" />
                        <label>
                            <input type="checkbox" checked={isAllFolderChecked} onChange={handleAllFolderChange} /> Tất
                            cả thư mục
                        </label>
                        <div className={cx('folder', { 'all-selected': isAllFolderChecked })}>
                            <span className={cx('arrow')} onClick={toggleFolder}>
                                <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} />
                            </span>
                            <FontAwesomeIcon icon={faFolder} className={cx('folder-icon')} />
                            <span>Root Folder</span>

                            {expanded && (
                                <div className={cx('sub-folder')}>
                                    <div>
                                        <FontAwesomeIcon icon={faFolder} className={cx('sub-folder-icon')} />
                                        Khu 1
                                    </div>
                                    <div>
                                        <FontAwesomeIcon icon={faFolder} className={cx('sub-folder-icon')} />
                                        Khu 2
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
                                {mockData.map((row, rowIdx) => (
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
                        <button className={cx('share')}>Share</button>
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
            <FolderModal />
            <TidyModal />
        </div>
    );
}

export default PlayContent;
