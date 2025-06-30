import { useAuth } from './useAuth';
import { PERMISSIONS } from '~/constants/permissions';

/**
 * Custom hook để kiểm tra quyền của user
 * 
 * @param {string|string[]} requiredPermissions - Quyền cần kiểm tra, có thể là string hoặc array of strings
 * @returns {Object} Kết quả kiểm tra quyền
 * 
 * Cách sử dụng cơ bản:
 * ```jsx
 * // Kiểm tra một quyền
 * const { hasPermission } = usePermission(PERMISSIONS.DASHBOARD);
 * if (hasPermission) {
 *   // User có quyền truy cập dashboard
 * }
 * 
 * // Kiểm tra nhiều quyền (phải có tất cả quyền)
 * const { hasPermission } = usePermission([PERMISSIONS.PLAY, PERMISSIONS.PLAN]);
 * 
 * // Kiểm tra có ít nhất một trong các quyền
 * const { hasAnyPermission } = usePermission([PERMISSIONS.PLAY, PERMISSIONS.PLAN]);
 * 
 * // Kiểm tra quyền trong điều kiện render
 * return (
 *   <div>
 *     {hasPermission && <DashboardComponent />}
 *   </div>
 * );
 * ```
 */
export const usePermission = (requiredPermissions) => {
    const { user, isLoading } = useAuth();

    /**
     * Kiểm tra một quyền cụ thể
     * @param {string} permission - Quyền cần kiểm tra
     * @returns {boolean} - true nếu user có quyền, false nếu không
     * 
     * Cách dùng:
     * const { checkPermission } = usePermission();
     * if (checkPermission(PERMISSIONS.DASHBOARD)) {
     *   // User có quyền dashboard
     * }
     */
    const checkPermission = (permission) => {
        if (!user || !user.menu) return false;
        return user.menu.includes(permission);
    };

    /**
     * Kiểm tra xem user có TẤT CẢ các quyền được yêu cầu hay không
     * @returns {boolean} - true nếu user có tất cả quyền, false nếu thiếu bất kỳ quyền nào
     * 
     * Cách dùng:
     * const { hasPermission } = usePermission([PERMISSIONS.PLAY, PERMISSIONS.PLAN]);
     * if (hasPermission) {
     *   // User có cả hai quyền PLAY và PLAN
     * }
     */
    const hasPermission = () => {
        if (!requiredPermissions) return true;
        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.every(permission => checkPermission(permission));
        }
        return checkPermission(requiredPermissions);
    };

    /**
     * Kiểm tra xem user có ÍT NHẤT MỘT trong các quyền được yêu cầu hay không
     * @returns {boolean} - true nếu user có ít nhất một quyền, false nếu không có quyền nào
     * 
     * Cách dùng:
     * const { hasAnyPermission } = usePermission([PERMISSIONS.PLAY, PERMISSIONS.PLAN]);
     * if (hasAnyPermission) {
     *   // User có ít nhất một trong hai quyền PLAY hoặc PLAN
     * }
     */
    const hasAnyPermission = () => {
        if (!requiredPermissions) return true;
        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.some(permission => checkPermission(permission));
        }
        return checkPermission(requiredPermissions);
    };

    /**
     * Lấy danh sách tất cả các quyền của user hiện tại
     * @returns {string[]} - Mảng chứa tất cả các quyền của user
     * 
     * Cách dùng:
     * const { getAllUserPermissions } = usePermission();
     * const userPermissions = getAllUserPermissions();
     * console.log('User có các quyền:', userPermissions);
     */
    const getAllUserPermissions = () => {
        if (!user || !user.menu) return [];
        return user.menu;
    };

    return {
        isLoading,              // Trạng thái loading của authentication
        hasPermission: hasPermission(),           // Có tất cả các quyền được yêu cầu
        hasAnyPermission: hasAnyPermission(),     // Có ít nhất một trong các quyền được yêu cầu
        checkPermission,        // Function kiểm tra một quyền cụ thể
        getAllUserPermissions,  // Function lấy tất cả quyền của user
        permissions: PERMISSIONS // Object chứa các constant quyền
    };
}; 