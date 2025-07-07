import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import Blog from '../models/Entity/blog.entity.js'
import { Role } from '../enum/role.enum.js'
import { Major } from '../enum/major.enum.js'

async function createBlogs() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const blogRepository = AppDataSource.getRepository(Blog)

    // Lấy tất cả consultant và staff
    const consultants = await accountRepository.find({
      where: { role: Role.CONSULTANT }
    })

    const staffs = await accountRepository.find({
      where: { role: Role.STAFF }
    })

    const allAuthors = [...consultants, ...staffs]
    console.log(`Found ${consultants.length} consultants and ${staffs.length} staffs`)

    // Dữ liệu blog mẫu cho từng chuyên ngành
    const blogTemplates = {
      [Major.ObstetricsandGynecology]: {
        titles: [
          'Chăm sóc sức khỏe phụ nữ trong thời kỳ mãn kinh',
          'Các dấu hiệu cảnh báo bệnh phụ khoa cần lưu ý',
          'Hướng dẫn khám phụ khoa định kỳ',
          'Chế độ dinh dưỡng cho phụ nữ mang thai',
          'Phòng ngừa ung thư cổ tử cung'
        ],
        contents: [
          'Thời kỳ mãn kinh là giai đoạn quan trọng trong cuộc đời của phụ nữ. Trong giai đoạn này, cơ thể có nhiều thay đổi về hormone, dẫn đến các triệu chứng như bốc hỏa, đổ mồ hôi đêm, khô âm đạo, và thay đổi tâm trạng. Việc chăm sóc sức khỏe đúng cách trong thời kỳ này rất quan trọng để duy trì chất lượng cuộc sống.',
          'Các bệnh phụ khoa thường gặp bao gồm viêm âm đạo, u xơ tử cung, lạc nội mạc tử cung, và ung thư cổ tử cung. Các dấu hiệu cảnh báo cần lưu ý: chảy máu bất thường, đau bụng dưới, tiết dịch âm đạo bất thường, đau khi quan hệ tình dục.',
          'Khám phụ khoa định kỳ là cách tốt nhất để phát hiện sớm các bệnh phụ khoa. Phụ nữ từ 21 tuổi trở lên nên khám phụ khoa ít nhất 1 lần/năm. Khám bao gồm: khám lâm sàng, xét nghiệm Pap smear, siêu âm tử cung buồng trứng.',
          'Dinh dưỡng đóng vai trò quan trọng trong thai kỳ. Phụ nữ mang thai cần bổ sung đầy đủ các chất dinh dưỡng như acid folic, sắt, canxi, vitamin D. Nên ăn nhiều rau xanh, trái cây, thịt nạc, cá, trứng, sữa.',
          'Ung thư cổ tử cung là bệnh ung thư phổ biến ở phụ nữ. Nguyên nhân chính là do nhiễm virus HPV. Cách phòng ngừa: tiêm vắc xin HPV, khám phụ khoa định kỳ, xét nghiệm Pap smear, quan hệ tình dục an toàn.'
        ]
      },
      [Major.Andrology]: {
        titles: [
          'Sức khỏe sinh sản nam giới',
          'Các bệnh nam khoa thường gặp',
          'Chế độ dinh dưỡng cho nam giới',
          'Phòng ngừa ung thư tuyến tiền liệt',
          'Rối loạn cương dương và cách điều trị'
        ],
        contents: [
          'Sức khỏe sinh sản nam giới bao gồm nhiều khía cạnh như chất lượng tinh trùng, hormone testosterone, và sức khỏe tình dục. Nam giới cần chú ý đến chế độ ăn uống, tập luyện, và khám sức khỏe định kỳ.',
          'Các bệnh nam khoa thường gặp: viêm tuyến tiền liệt, phì đại tuyến tiền liệt, ung thư tinh hoàn, ung thư tuyến tiền liệt, rối loạn cương dương. Các dấu hiệu cần lưu ý: đau khi đi tiểu, tiểu nhiều lần, đau tinh hoàn.',
          'Dinh dưỡng đóng vai trò quan trọng trong sức khỏe nam giới. Nam giới cần bổ sung đầy đủ protein, vitamin D, kẽm, selen. Nên ăn nhiều thịt nạc, cá, trứng, hạt, rau xanh.',
          'Ung thư tuyến tiền liệt là bệnh ung thư phổ biến ở nam giới. Nguyên nhân chưa rõ ràng nhưng có thể do tuổi tác, di truyền, chế độ ăn uống. Cách phòng ngừa: khám sức khỏe định kỳ, xét nghiệm PSA.',
          'Rối loạn cương dương là tình trạng không thể đạt được hoặc duy trì sự cương cứng đủ để quan hệ tình dục. Nguyên nhân có thể do bệnh lý (tiểu đường, tim mạch) hoặc tâm lý. Điều trị bao gồm thuốc, liệu pháp tâm lý.'
        ]
      },
      [Major.Urology]: {
        titles: [
          'Các bệnh tiết niệu thường gặp',
          'Sỏi thận và cách phòng ngừa',
          'Nhiễm trùng đường tiết niệu',
          'Ung thư bàng quang',
          'Chăm sóc sức khỏe thận'
        ],
        contents: [
          'Các bệnh tiết niệu thường gặp bao gồm: sỏi thận, nhiễm trùng đường tiết niệu, viêm bàng quang, ung thư bàng quang, ung thư thận. Các triệu chứng chung: đau khi đi tiểu, tiểu nhiều lần, tiểu ra máu.',
          'Sỏi thận là bệnh lý phổ biến, hình thành do sự kết tinh của các chất trong nước tiểu. Nguyên nhân: uống ít nước, chế độ ăn nhiều muối, protein. Cách phòng ngừa: uống đủ nước, hạn chế muối.',
          'Nhiễm trùng đường tiết niệu thường gặp ở phụ nữ hơn nam giới. Triệu chứng: đau buốt khi đi tiểu, tiểu nhiều lần, nước tiểu đục. Điều trị bằng kháng sinh, uống nhiều nước.',
          'Ung thư bàng quang là bệnh ung thư phổ biến ở đường tiết niệu. Nguyên nhân: hút thuốc lá, tiếp xúc hóa chất, nhiễm trùng đường tiết niệu mạn tính. Triệu chứng: tiểu ra máu, đau khi đi tiểu.',
          'Thận đóng vai trò quan trọng trong việc lọc máu và bài tiết chất thải. Cách chăm sóc: uống đủ nước, hạn chế muối, protein, khám sức khỏe định kỳ, kiểm soát huyết áp, đường huyết.'
        ]
      },
      [Major.Dermatology]: {
        titles: [
          'Chăm sóc da mụn',
          'Các bệnh da liễu thường gặp',
          'Phòng ngừa ung thư da',
          'Chăm sóc da mùa hè',
          'Các bệnh da do nấm'
        ],
        contents: [
          'Mụn là bệnh da liễu phổ biến, đặc biệt ở tuổi dậy thì. Nguyên nhân: tăng tiết bã nhờn, vi khuẩn, hormone. Cách chăm sóc: rửa mặt sạch, không nặn mụn, sử dụng kem chống nắng.',
          'Các bệnh da liễu thường gặp: viêm da cơ địa, vảy nến, nấm da, mụn cóc, herpes. Triệu chứng chung: ngứa, đỏ da, bong vảy. Điều trị tùy theo nguyên nhân và mức độ.',
          'Ung thư da là bệnh ung thư phổ biến nhất. Nguyên nhân chính: tiếp xúc tia UV. Cách phòng ngừa: bôi kem chống nắng, mặc quần áo bảo vệ, tránh nắng giữa trưa, khám da định kỳ.',
          'Mùa hè da dễ bị tổn thương do nắng nóng. Cách chăm sóc: bôi kem chống nắng, uống đủ nước, mặc quần áo thoáng mát, tắm rửa sạch sẽ, dưỡng ẩm da.',
          'Nấm da là bệnh nhiễm trùng do nấm, thường gặp ở những vùng da ẩm ướt. Triệu chứng: ngứa, đỏ da, bong vảy hình tròn. Điều trị bằng thuốc chống nấm, giữ da khô ráo.'
        ]
      },
      [Major.InfectiousDiseases]: {
        titles: [
          'Các bệnh lây truyền qua đường tình dục',
          'Phòng ngừa HIV/AIDS',
          'Bệnh viêm gan B và C',
          'Các bệnh nhiễm trùng thường gặp',
          'Vắc xin cho người lớn'
        ],
        contents: [
          'Các bệnh lây truyền qua đường tình dục (STIs) bao gồm: HIV, giang mai, lậu, chlamydia, herpes, HPV. Cách phòng ngừa: quan hệ tình dục an toàn, sử dụng bao cao su, khám sức khỏe định kỳ.',
          'HIV/AIDS là bệnh nhiễm trùng mạn tính do virus HIV. Hiện chưa có thuốc chữa khỏi nhưng có thể kiểm soát bằng thuốc ARV. Cách phòng ngừa: quan hệ tình dục an toàn, không dùng chung kim tiêm.',
          'Viêm gan B và C là bệnh viêm gan do virus. Viêm gan B có thể phòng ngừa bằng vắc xin. Viêm gan C hiện chưa có vắc xin nhưng có thể chữa khỏi bằng thuốc. Cả hai bệnh đều có thể dẫn đến xơ gan, ung thư gan.',
          'Các bệnh nhiễm trùng thường gặp: cảm cúm, viêm phổi, viêm dạ dày ruột, nhiễm trùng da. Triệu chứng chung: sốt, mệt mỏi, đau nhức. Điều trị tùy theo nguyên nhân.',
          'Vắc xin không chỉ dành cho trẻ em mà còn quan trọng cho người lớn. Các vắc xin cần thiết: cúm hàng năm, viêm gan B, uốn ván, sởi-quai bị-rubella, phế cầu.'
        ]
      },
      [Major.Endocrinology]: {
        titles: [
          'Bệnh tiểu đường và cách kiểm soát',
          'Bệnh tuyến giáp',
          'Rối loạn hormone ở phụ nữ',
          'Béo phì và hội chứng chuyển hóa',
          'Chế độ dinh dưỡng cho bệnh nhân nội tiết'
        ],
        contents: [
          'Tiểu đường là bệnh rối loạn chuyển hóa glucose. Có 2 loại: type 1 (thiếu insulin) và type 2 (kháng insulin). Điều trị: thuốc, chế độ ăn, tập luyện, kiểm soát đường huyết thường xuyên.',
          'Bệnh tuyến giáp bao gồm: cường giáp, suy giáp, bướu giáp. Triệu chứng: mệt mỏi, thay đổi cân nặng, rối loạn nhịp tim. Điều trị bằng thuốc hoặc phẫu thuật tùy theo bệnh.',
          'Rối loạn hormone ở phụ nữ có thể gây: rối loạn kinh nguyệt, vô sinh, hội chứng buồng trứng đa nang. Nguyên nhân: stress, chế độ ăn, di truyền. Điều trị: thuốc hormone, thay đổi lối sống.',
          'Béo phì và hội chứng chuyển hóa làm tăng nguy cơ bệnh tim mạch, tiểu đường. Nguyên nhân: chế độ ăn nhiều calo, ít vận động. Điều trị: giảm cân, tập luyện, thuốc.',
          'Chế độ dinh dưỡng quan trọng trong điều trị bệnh nội tiết. Nguyên tắc: cân bằng calo, hạn chế đường, tăng chất xơ, protein. Nên ăn nhiều rau xanh, trái cây, thịt nạc.'
        ]
      },
      [Major.Psychiatry]: {
        titles: [
          'Trầm cảm và cách điều trị',
          'Rối loạn lo âu',
          'Stress và cách quản lý',
          'Rối loạn giấc ngủ',
          'Sức khỏe tâm thần trong đại dịch'
        ],
        contents: [
          'Trầm cảm là bệnh tâm thần phổ biến, đặc trưng bởi tâm trạng buồn, mất hứng thú. Triệu chứng: buồn bã, mệt mỏi, mất ngủ, chán ăn. Điều trị: thuốc chống trầm cảm, liệu pháp tâm lý.',
          'Rối loạn lo âu bao gồm: rối loạn lo âu lan tỏa, rối loạn hoảng sợ, ám ảnh sợ. Triệu chứng: lo lắng quá mức, tim đập nhanh, đổ mồ hôi. Điều trị: thuốc, liệu pháp nhận thức hành vi.',
          'Stress là phản ứng bình thường của cơ thể nhưng stress mạn tính có hại cho sức khỏe. Cách quản lý: tập thở, thiền, tập luyện, nghỉ ngơi đầy đủ, chia sẻ với người thân.',
          'Rối loạn giấc ngủ bao gồm: mất ngủ, ngủ quá nhiều, rối loạn nhịp sinh học. Nguyên nhân: stress, bệnh lý, thuốc. Điều trị: vệ sinh giấc ngủ, thuốc ngủ, liệu pháp tâm lý.',
          'Đại dịch COVID-19 ảnh hưởng lớn đến sức khỏe tâm thần. Nhiều người gặp stress, lo âu, trầm cảm. Cách đối phó: duy trì kết nối xã hội, tập luyện tại nhà, hạn chế tin tức tiêu cực.'
        ]
      }
    }

    const blogs = []

    for (const author of allAuthors) {
      // Chọn ngẫu nhiên một chuyên ngành
      const majors = Object.values(Major)
      const randomMajor = majors[Math.floor(Math.random() * majors.length)]

      // Chọn ngẫu nhiên template cho chuyên ngành đó
      const template = blogTemplates[randomMajor]
      const titleIndex = Math.floor(Math.random() * template.titles.length)
      const contentIndex = Math.floor(Math.random() * template.contents.length)

      const blog = {
        major: randomMajor,
        title: template.titles[titleIndex],
        content: template.contents[contentIndex],
        images: [], // Không có hình ảnh
        status: true, // Đã được duyệt
        account: author
      }

      blogs.push(blog)
    }

    // Lưu tất cả blogs vào database
    const savedBlogs = await blogRepository.save(blogs)

    console.log(`✅ Successfully created ${savedBlogs.length} blogs`)
    console.log(`📊 Summary:`)
    console.log(`- ${consultants.length} consultant blogs`)
    console.log(`- ${staffs.length} staff blogs`)
    console.log(`- Total: ${savedBlogs.length} blogs`)

    // Thống kê theo chuyên ngành
    const majorStats = {}
    savedBlogs.forEach((blog) => {
      majorStats[blog.major] = (majorStats[blog.major] || 0) + 1
    })

    console.log('\n📋 Blogs by major:')
    Object.entries(majorStats).forEach(([major, count]) => {
      console.log(`- ${major}: ${count} blogs`)
    })
  } catch (error) {
    console.error('❌ Error creating blogs:', error)
  } finally {
    // Đóng kết nối database
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

// Chạy script
createBlogs()
