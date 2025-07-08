export enum Role {
  ADMIN, //0
  CONSULTANT, //1
  STAFF, //2
  CUSTOMER, //3
  MANAGER, //4
  RECEPTIONIST //5
}

function convertRoleToString(roleValue: Role): string | undefined {
  // TypeScript cho phép truy cập tên của enum bằng chỉ số của nó
  return Role[roleValue]
}

function convertStringToRole(roleName: string): Role | undefined {
  // TypeScript cũng cho phép truy cập giá trị của enum bằng tên (dưới dạng chuỗi)
  return Role[roleName as keyof typeof Role]
}

/**
 * Chuyển đổi một giá trị số thành một thành viên của một enum dạng số một cách an toàn.
 * Nếu giá trị không hợp lệ, hàm sẽ trả về undefined.
 * @param enumObject - Đối tượng Enum bạn muốn chuyển đổi đến (ví dụ: Role).
 * @param value - Giá trị số (hoặc chuỗi số) cần chuyển đổi.
 * @returns Thành viên của enum nếu hợp lệ, ngược lại trả về undefined.
 */
export function parseNumericEnum(value: number): Role | undefined {
  // 1. Kiểm tra nếu giá trị đầu vào là null hoặc undefined
  if (value === null || value === undefined || typeof value !== 'number') {
    return undefined
  }

  // 4. Lấy ra tất cả các giá trị số hợp lệ của enum
  // Object.values(enumObject) sẽ trả về cả key (string) và value (number)
  // ví dụ: ['ADMIN', 'CONSULTANT', ..., 0, 1, 2, ...]
  // nên chúng ta cần lọc ra chỉ các giá trị là số.
  const enumValues = Object.values(Role).filter((v) => typeof v === 'number') as number[]

  // 5. Kiểm tra xem giá trị số có nằm trong danh sách các giá trị hợp lệ của enum không
  if (enumValues.includes(value)) {
    // Nếu hợp lệ, chúng ta có thể trả về nó. TypeScript sẽ hiểu đây là một kiểu Enum.
    return value as Role
  }

  // 6. Nếu không tìm thấy, trả về undefined
  return undefined
}
