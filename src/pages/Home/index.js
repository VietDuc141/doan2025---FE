import classNames from 'classnames/bind';
import styles from './Home.module.scss';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faDesktop, faServer, faGears, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const barData = [{ name: 'April', value: 2.3 }];
const pieData = [
    { name: 'Image KiB', value: 60, color: '#1f441e' },
    { name: 'Font KiB', value: 35, color: '#3b5998' },
    { name: 'Playersoftware KiB', value: 5, color: '#39ff14' },
];

const DashboardCardOne = ({ title, value, iconColor }) => (
    <div className={cx('dashboard-card')}>
        <div className={cx('icon')} style={{ backgroundColor: iconColor }}>
            <FontAwesomeIcon icon={faDesktop} />
        </div>
        <div className={cx('value')}>{value}</div>
        <div className={cx('label')}>{title}</div>
    </div>
);

const DashboardCardTwo = ({ title, value, iconColor }) => (
    <div className={cx('dashboard-card')}>
        <div className={cx('icon')} style={{ backgroundColor: iconColor }}>
            <FontAwesomeIcon icon={faUsers} />
        </div>
        <div className={cx('value')}>{value}</div>
        <div className={cx('label')}>{title}</div>
    </div>
);

const DashboardCardThree = ({ title, value, iconColor }) => (
    <div className={cx('dashboard-card')}>
        <div className={cx('icon')} style={{ backgroundColor: iconColor }}>
            <FontAwesomeIcon icon={faServer} />
        </div>
        <div className={cx('value')}>{value}</div>
        <div className={cx('label')}>{title}</div>
    </div>
);

const DashboardCardFour = ({ title, value, iconColor }) => (
    <div className={cx('dashboard-card')}>
        <div className={cx('icon')} style={{ backgroundColor: iconColor }}>
            <FontAwesomeIcon icon={faGears} />
        </div>
        <div className={cx('value')}>{value}</div>
        <div className={cx('label')}>{title}</div>
    </div>
);

function Home() {
    return (
        <div className={cx('dashboard-content')}>
            <div className={cx('cards')}>
                <DashboardCardOne title="Màn hình" value={2} iconColor="#f1c40f" />
                <DashboardCardTwo title="Dung lượng thư viện" value="1.3 MiB" iconColor="#c0392b" />
                <DashboardCardThree title="Người sử dụng" value={2} iconColor="#16a085" />
                <DashboardCardFour title="Đang phát" value={0} iconColor="#2980b9" />
            </div>

            <div className={cx('charts')}>
                <div className={cx('chart-box')}>
                    <h3>Bảng thông sử dụng (MiB)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3498db" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className={cx('chart-box')}>
                    <h3>Library Usage</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" outerRadius={80} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="top" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={cx('device-status')}>
                <h3>Thiết bị hoạt động</h3>
                <table className={cx('device-table')}>
                    <thead>
                        <tr>
                            <th>Màn hình</th>
                            <th>Đã đăng nhập</th>
                            <th>Đã được cấp phép</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>DESKTOP-4FJ4FV3</td>
                            <td>
                                <FontAwesomeIcon icon={faCheck} />
                            </td>
                            <td>
                                <FontAwesomeIcon icon={faCheck} />
                            </td>
                        </tr>
                        <tr>
                            <td>DESKTOP-GO8FMT</td>
                            <td>
                                <FontAwesomeIcon icon={faXmark} />
                            </td>
                            <td>
                                <FontAwesomeIcon icon={faXmark} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}


export default Home;
