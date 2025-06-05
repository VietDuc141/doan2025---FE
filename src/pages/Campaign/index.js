import classNames from 'classnames/bind';
import styles from './Campaign.module.scss';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSync, faPlus, faFolder, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
    'Loại mục tiêu',
    'Mục tiêu',
    'Phát',
    'Lượt hiển thị',
];

const mockData = [
    {
        'Tên': 'Chiến dịch A',
        'Thể loại': 'Danh Sách',
        'Ngày bắt đầu': '2025-05-01',
        'Ngày kết thúc': '2025-05-10',
        '# Bố cục': 1,
        'Nhãn': 'bgvguhb',
        'Thời lượng': '00:01:00',
        'Phát lại theo chu kỳ': 'Bật',
        'Số lần phát': 5,
        'Loại mục tiêu': 'Loại A',
        'Mục tiêu': 'Mục tiêu A',
        'Phát': 'Phát A',
    },
    {
        'Tên': 'Chiến dịch B',
        'Thể loại': 'Danh Sách',
        'Ngày bắt đầu': '2025-05-02',
        'Ngày kết thúc': '2025-05-12',
        '# Bố cục': 0,
        'Nhãn': '1|1',
        'Thời lượng': '00:00:30',
        'Phát lại theo chu kỳ': 'Tắt',
        'Số lần phát': 3,
        'Loại mục tiêu': 'Loại B',
        'Mục tiêu': 'Mục tiêu B',
        'Phát': 'Phát B',
    },
];

function Campaign() {
    const [visibleColumns, setVisibleColumns] = useState(['Tên', 'Thể loại', 'Ngày bắt đầu', 'Ngày kết thúc']);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [isAllFolderChecked, setIsAllFolderChecked] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFolderPath, setSelectedFolderPath] = useState('');

    const typeOptions = [
        { value: 'layout_list', label: 'Danh sách bố cục' },
        { value: 'ad_campaign', label: 'Đợt phát quảng cáo' },
    ];

    const orderOptions = [
        { value: 'round_robin', label: 'Xoay vòng' },
        { value: 'sequential', label: 'Chặn' },
    ];

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

    const handleFolderSelect = (folder, path) => {
        setSelectedFolder(folder);
        setSelectedFolderPath(path);
    };

    const handleFolderModalClose = () => {
        setShowFolderModal(false);
    };

    const handleFolderModalSubmit = () => {
        setShowFolderModal(false);
    };

    return (
        <div className={cx('campaign')}>
            <div className={cx('header')}>
                <h2>Đợt phát</h2>
                <div className={cx('actions')}>
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className={cx('add')} onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Thêm đợt phát
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Nhãn</label>
                    <input type="text" />
                </div>
                <div className={cx('filter-group')}>
                    <label>ID bố cục</label>
                    <input type="number" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Thể loại</label>
                    <select>
                        <option></option>
                        <option>Danh sách bố cục</option>
                        <option>Đợt phát quảng cáo</option>
                    </select>
                </div>
                <div className={cx('filter-group')}>
                    <label>Phát lại theo chu kỳ</label>
                    <select>
                        <option></option>
                        <option>Tắt</option>
                        <option>Bật</option>
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

            {showModal && (
                <div className={cx('modal')}>
                    <div className={cx('modal-overlay')} onClick={() => setShowModal(false)} />
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm Đợt Phát</h3>
                            <button className={cx('close')} onClick={() => setShowModal(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className={cx('modal-body')}>
                            <div className={cx('form-group')}>
                                <label>Thư mục</label>
                                <div className={cx('folder-selection')}>
                                    <button className={cx('folder-button')} onClick={() => setShowFolderModal(true)}>
                                        Chọn thư mục
                                    </button>
                                    {selectedFolderPath && (
                                        <span className={cx('selected-path')}>{selectedFolderPath}</span>
                                    )}
                                </div>
                                <small>Chọn thư mục cho đợt phát này</small>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Thể loại</label>
                                <select>
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
                                <input type="text" placeholder="Nhập tên đợt phát" />
                                <small>Tên cho đợt phát này</small>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Nhãn</label>
                                <input type="text" placeholder="Nhập nhãn" />
                                <small>
                                    Nhãn cho đợt phát này - Dấy các nhãn, phân cách bằng dấu phẩy hoặc theo định dạng
                                    Nhãn|Giá trị. Nếu bạn chọn một nhãn có kèm giá trị, các giá trị đó sẽ hiển thị để
                                    bạn lựa chọn bên dưới.
                                </small>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Thứ tự phát trong danh sách</label>
                                <select>
                                    <option value="">Chọn thứ tự phát</option>
                                    {orderOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <small>
                                    Khi đợt phát này được lên lịch cùng với một đợt phát khác có cùng thứ tự hiển thị,
                                    thì các bố cục của cả hai chiến dịch sẽ được sắp xếp theo thứ tự như thế nào?
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

            {showFolderModal && (
                <div className={cx('modal')}>
                    <div className={cx('modal-overlay')} onClick={handleFolderModalClose} />
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Chọn thư mục</h3>
                            <button className={cx('close')} onClick={handleFolderModalClose}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className={cx('modal-body')}>
                            <div className={cx('folder-select')}>
                                <input type="text" placeholder="Tìm Kiếm" />
                                <div className={cx('folder-tree')}>
                                    <div
                                        className={cx('folder-item', {
                                            selected: selectedFolder === 'root',
                                        })}
                                        onClick={() => handleFolderSelect('root', 'Root Folder')}
                                    >
                                        <FontAwesomeIcon icon={faFolder} className={cx('icon')} />
                                        Root Folder
                                    </div>
                                    <div
                                        className={cx('folder-item', {
                                            selected: selectedFolder === 'khu1',
                                        })}
                                        style={{ marginLeft: '20px' }}
                                        onClick={() => handleFolderSelect('khu1', 'Root Folder > Khu 1')}
                                    >
                                        <FontAwesomeIcon icon={faFolder} className={cx('icon')} />
                                        Khu 1
                                    </div>
                                    <div
                                        className={cx('folder-item', {
                                            selected: selectedFolder === 'khu2',
                                        })}
                                        style={{ marginLeft: '20px' }}
                                        onClick={() => handleFolderSelect('khu2', 'Root Folder > Khu 2')}
                                    >
                                        <FontAwesomeIcon icon={faFolder} className={cx('icon')} />
                                        Khu 2
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx('modal-footer')}>
                            <button className={cx('cancel')} onClick={handleFolderModalClose}>
                                Hủy
                            </button>
                            <button
                                className={cx('submit')}
                                onClick={handleFolderModalSubmit}
                                disabled={!selectedFolder}
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Campaign;
