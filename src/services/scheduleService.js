import { getSocket } from './socketService';

class ScheduleService {
    constructor() {
        this.schedules = [];
        this.checkInterval = null;
    }

    // Khởi tạo service và bắt đầu kiểm tra lịch
    initialize(schedules) {
        this.schedules = schedules;
        this.startChecking();

        // Lắng nghe sự kiện cập nhật lịch từ server
        const socket = getSocket();
        if (socket) {
            socket.on('schedule-update', (updatedSchedules) => {
                this.updateSchedules(updatedSchedules);
            });
        }
    }

    // Cập nhật danh sách lịch
    updateSchedules(newSchedules) {
        this.schedules = newSchedules;
    }

    // Bắt đầu kiểm tra lịch định kỳ (mỗi phút)
    startChecking() {
        if (!this.checkInterval) {
            this.checkInterval = setInterval(() => {
                this.checkSchedules();
            }, 60000); // Kiểm tra mỗi phút
        }
    }

    // Dừng kiểm tra lịch
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Kiểm tra các lịch và thực thi nếu đến giờ
    checkSchedules() {
        const now = new Date();
        this.schedules.forEach(schedule => {
            const startTime = new Date(schedule.startTime);
            if (this.shouldExecute(now, startTime)) {
                this.executeSchedule(schedule);
            }
        });
    }

    // Kiểm tra xem có nên thực thi lịch không
    shouldExecute(now, startTime) {
        return now.getTime() >= startTime.getTime() &&
            now.getTime() < startTime.getTime() + 60000; // Trong khoảng 1 phút
    }

    // Thực thi một lịch cụ thể
    executeSchedule(schedule) {
        const socket = getSocket();
        if (socket) {
            socket.emit('execute-schedule', {
                scheduleId: schedule.id,
                timestamp: new Date().toISOString()
            });
        }

        // Thực hiện các hành động khác tùy theo loại lịch
        if (typeof schedule.onExecute === 'function') {
            schedule.onExecute();
        }
    }
}

export const scheduleService = new ScheduleService(); 