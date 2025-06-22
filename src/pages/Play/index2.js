import classNames from 'classnames/bind';
import styles from './Play.module.scss';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Play() {
    const [selectedId, setSelectedId] = useState(null);

    // Dummy data for content selection table, similar to PlayContent
    const mockContentData = [
        { id: 1, type: 'Video', name: 'Intro Video', duration: '00:30', size: '10MB' },
        { id: 2, type: 'Image', name: 'Background Image', duration: '00:05', size: '2MB' },
        { id: 3, type: 'Text', name: 'Welcome Message', duration: '00:10', size: '0.1MB' },
    ];

    return (
        <div className={cx('play-page')}>
            <div className={cx('header')}>
                <h2>Nội dung phát</h2>
                <div className={cx('actions')}>
                    <button className={cx('add')}>
                        <FontAwesomeIcon icon={faPlay} /> Phát
                    </button>
                </div>
            </div>

            <div className={cx('filter-bar')}>
                <div className={cx('filter-group')}>
                    <label>Tên</label>
                    <input type="text" placeholder="Nhập tên" />
                </div>
                <div className={cx('filter-group')}>
                    <label>ID</label>
                    <input type="text" placeholder="Nhập ID" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Đến lúc</label>
                    <input type="time" />
                </div>
                <div className={cx('filter-group')}>
                    <label>Đến Ngày</label>
                    <input type="date" />
                </div>
            </div>

            <div className={cx('table-container')}>
                <h3>Chọn nội dung phát</h3>
                <table className={cx('content-table')}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Loại</th>
                        <th>Tên</th>
                        <th>Thời lượng</th>
                        <th>Kích thước</th>
                        <th>Chọn</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mockContentData.map((content) => (
                        <tr key={content.id}>
                            <td>{content.id}</td>
                            <td>{content.type}</td>
                            <td>{content.name}</td>
                            <td>{content.duration}</td>
                            <td>{content.size}</td>
                            <td>
                                <input
                                    type="radio"
                                    name="option"
                                    checked={selectedId === content.id}
                                    onChange={() => setSelectedId(content.id)}
                                />
                            </td>
                        </tr>
                    ))}
                    {mockContentData.length === 0 && (
                        <tr>
                            <td colSpan="6" className={cx('no-data')}>
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Play;
