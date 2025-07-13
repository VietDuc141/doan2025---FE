import classNames from 'classnames/bind';
import styles from './Home.module.scss';

import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDesktop, faGears, faServer, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useContentSizeByType, useTotalContentSize } from '~/api/queries/contentQueries';
import { useOnlineUsersCount } from '~/api/queries/userQueries';

const cx = classNames.bind(styles);

const barData = [{ name: 'April', value: 2.3 }];

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
    const totalContentSize = useTotalContentSize();
    const onlineUsers = useOnlineUsersCount();
    console.log('Online users data:', onlineUsers.data);
    console.log('Loading:', onlineUsers.isLoading);
    console.log('Error:', onlineUsers.error);
    const contentSizeByType = useContentSizeByType();

    // Transform API data for pie chart
    const pieData =
        contentSizeByType.data?.data.map((item) => ({
            name: `${item.type} (${item.sizeInMB} MB)`,
            value: parseFloat(item.sizeInMB),
            count: item.count,
            color: item.type === 'image' ? '#1f441e' : item.type === 'video' ? '#3b5998' : '#39ff14',
        })) || [];

    return (
        <div className={cx('dashboard-content')}>
            <div className={cx('cards')}>
                <DashboardCardTwo
                    title="Dung lượng thư viện"
                    value={`${totalContentSize.data?.data.totalSizeMB.toFixed(2)} MB`}
                    iconColor="#c0392b"
                />
                <DashboardCardThree
                    title="Người sử dụng"
                    value={onlineUsers.data?.data.count || 0}
                    iconColor="#16a085"
                />
                <DashboardCardFour title="Đang phát" value={0} iconColor="#2980b9" />
            </div>

            <div className={cx('charts')}>
                <div className={cx('chart-box')}>
                    <h3>Băng thông sử dụng (MiB)</h3>
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
                    <h3>Dung lượng thư viện</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                label={({ name }) => name}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="top" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Home;
