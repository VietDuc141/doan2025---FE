/**
 * Định nghĩa các quyền trong hệ thống
 * 
 * Cách sử dụng:
 * import { PERMISSIONS } from '~/constants/permissions';
 * 
 * // Sử dụng trực tiếp
 * const dashboardPermission = PERMISSIONS.DASHBOARD; // 'dashboard'
 * 
 * // Sử dụng với usePermission hook
 * const { hasPermission } = usePermission(PERMISSIONS.DASHBOARD);
 * 
 * // Kiểm tra nhiều quyền
 * const { hasPermission } = usePermission([PERMISSIONS.PLAY, PERMISSIONS.PLAN]);
 */
export const PERMISSIONS = {
    DASHBOARD: 'dashboard',    // Quyền xem bảng điều khiển
    PLAN: 'plan',             // Quyền quản lý kế hoạch phát
    PLAY_CONTENT: 'play-content', // Quyền quản lý nội dung phát
    TIMELINE: 'timeline',      // Quyền quản lý thời gian phát
    CAMPAIGN: 'campaign',      // Quyền quản lý chiến dịch
    USER: 'user',             // Quyền quản lý người dùng
    PLAY: 'play'              // Quyền phát nội dung
};

/**
 * Mô tả chi tiết cho từng quyền trong hệ thống
 * 
 * Cách sử dụng:
 * import { PERMISSION_DESCRIPTIONS } from '~/constants/permissions';
 * 
 * // Lấy mô tả của một quyền
 * const description = PERMISSION_DESCRIPTIONS[PERMISSIONS.DASHBOARD];
 * 
 * // Hiển thị mô tả trong UI
 * <span>{PERMISSION_DESCRIPTIONS[permission]}</span>
 */
export const PERMISSION_DESCRIPTIONS = {
    [PERMISSIONS.DASHBOARD]: 'Truy cập bảng điều khiển',
    [PERMISSIONS.PLAN]: 'Quản lý lịch phát',
    [PERMISSIONS.PLAY_CONTENT]: 'Quản lý nội dung',
    [PERMISSIONS.TIMELINE]: 'Quản lý khung giờ phát',
    [PERMISSIONS.CAMPAIGN]: 'Quản lý đợt phát',
    [PERMISSIONS.USER]: 'Quản lý người dùng',
    [PERMISSIONS.PLAY]: 'Phát nội dung'
}; 