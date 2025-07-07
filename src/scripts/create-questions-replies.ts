import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import Question from '../models/Entity/question.entity.js'
import Reply from '../models/Entity/reply.entity.js'
import { Role } from '../enum/role.enum.js'

async function createQuestionsReplies() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const questionRepository = AppDataSource.getRepository(Question)
    const replyRepository = AppDataSource.getRepository(Reply)

    // Lấy tất cả customer và consultant
    const customers = await accountRepository.find({
      where: { role: Role.CUSTOMER }
    })

    const consultants = await accountRepository.find({
      where: { role: Role.CONSULTANT }
    })

    console.log(`Found ${customers.length} customers and ${consultants.length} consultants`)

    if (customers.length === 0 || consultants.length === 0) {
      console.log('❌ No customers or consultants found')
      return
    }

    // Dữ liệu câu hỏi mẫu
    const questionTemplates = [
      {
        question: 'Tôi bị đau bụng dưới và chảy máu bất thường, có phải là dấu hiệu của bệnh phụ khoa không?',
        reply:
          'Chào bạn! Đau bụng dưới kèm chảy máu bất thường có thể là dấu hiệu của nhiều bệnh lý khác nhau như viêm âm đạo, u xơ tử cung, hoặc rối loạn kinh nguyệt. Tuy nhiên, để chẩn đoán chính xác, bạn nên đến khám tại cơ sở y tế để được kiểm tra cụ thể. Bác sĩ sẽ thực hiện khám lâm sàng và có thể chỉ định siêu âm hoặc xét nghiệm cần thiết.'
      },
      {
        question:
          'Chu kỳ kinh nguyệt của tôi không đều, có khi 25 ngày, có khi 40 ngày. Điều này có bình thường không?',
        reply:
          'Chu kỳ kinh nguyệt không đều có thể do nhiều nguyên nhân như stress, thay đổi cân nặng, rối loạn hormone, hoặc các bệnh lý khác. Chu kỳ bình thường thường từ 21-35 ngày. Nếu tình trạng này kéo dài, bạn nên khám phụ khoa để kiểm tra hormone và tìm nguyên nhân cụ thể.'
      },
      {
        question:
          'Tôi muốn tìm hiểu về các phương pháp tránh thai an toàn và hiệu quả. Bác sĩ có thể tư vấn giúp tôi không?',
        reply:
          'Có nhiều phương pháp tránh thai hiện đại và an toàn như: bao cao su, thuốc tránh thai, vòng tránh thai, que cấy tránh thai. Mỗi phương pháp có ưu nhược điểm riêng. Để chọn phương pháp phù hợp, bạn nên khám phụ khoa để bác sĩ đánh giá tình trạng sức khỏe và tư vấn cụ thể.'
      },
      {
        question: 'Tôi có triệu chứng ngứa và tiết dịch âm đạo bất thường. Có phải bị viêm âm đạo không?',
        reply:
          'Các triệu chứng bạn mô tả có thể là dấu hiệu của viêm âm đạo. Nguyên nhân có thể do nhiễm nấm, vi khuẩn, hoặc ký sinh trùng. Bạn nên khám phụ khoa để được chẩn đoán chính xác và điều trị phù hợp. Tránh tự ý mua thuốc điều trị mà không có chỉ định của bác sĩ.'
      },
      {
        question: 'Tôi đang mang thai 3 tháng đầu và bị ốm nghén nặng. Có cách nào giảm bớt không?',
        reply:
          'Ốm nghén là hiện tượng bình thường trong 3 tháng đầu thai kỳ. Để giảm bớt, bạn có thể: ăn nhiều bữa nhỏ, tránh thức ăn có mùi mạnh, uống đủ nước, nghỉ ngơi đầy đủ. Nếu ốm nghén quá nặng ảnh hưởng đến sức khỏe, hãy đến khám bác sĩ để được tư vấn thêm.'
      },
      {
        question: 'Tôi muốn kiểm tra sức khỏe sinh sản nam giới. Cần làm những xét nghiệm gì?',
        reply:
          'Để kiểm tra sức khỏe sinh sản nam giới, bạn cần làm các xét nghiệm: tinh dịch đồ, hormone testosterone, xét nghiệm STIs, siêu âm tinh hoàn. Bác sĩ sẽ khám lâm sàng và chỉ định các xét nghiệm phù hợp dựa trên tình trạng cụ thể của bạn.'
      },
      {
        question: 'Tôi bị rối loạn cương dương. Có phải do tuổi tác không?',
        reply:
          'Rối loạn cương dương có thể do nhiều nguyên nhân: tuổi tác, bệnh lý (tiểu đường, tim mạch), stress, thuốc men, hoặc tâm lý. Để chẩn đoán chính xác, bạn nên khám nam khoa để được đánh giá toàn diện và có phương pháp điều trị phù hợp.'
      },
      {
        question: 'Tôi có dấu hiệu tiểu nhiều lần và đau khi đi tiểu. Có phải bị viêm đường tiết niệu không?',
        reply:
          'Các triệu chứng bạn mô tả có thể là dấu hiệu của viêm đường tiết niệu. Bạn nên đến khám bác sĩ để được chẩn đoán chính xác. Điều trị thường bằng kháng sinh và uống nhiều nước. Nếu không điều trị kịp thời có thể dẫn đến biến chứng.'
      },
      {
        question: 'Tôi muốn tìm hiểu về các bệnh lây truyền qua đường tình dục. Cách phòng ngừa như thế nào?',
        reply:
          'Các bệnh lây truyền qua đường tình dục (STIs) bao gồm HIV, giang mai, lậu, chlamydia, herpes, HPV. Cách phòng ngừa: quan hệ tình dục an toàn, sử dụng bao cao su, khám sức khỏe định kỳ, tiêm vắc xin HPV. Nếu có dấu hiệu nghi ngờ, hãy đến khám ngay.'
      },
      {
        question: 'Tôi bị mụn cóc sinh dục. Có nguy hiểm không và cách điều trị như thế nào?',
        reply:
          'Mụn cóc sinh dục do virus HPV gây ra. Bệnh có thể lây truyền và một số type HPV có thể gây ung thư. Điều trị bao gồm: thuốc bôi, đốt điện, laser, hoặc phẫu thuật. Bạn nên đến khám bác sĩ để được điều trị phù hợp và tư vấn phòng ngừa.'
      },
      {
        question: 'Tôi muốn kiểm tra hormone nữ. Cần làm xét nghiệm gì và khi nào làm?',
        reply:
          'Để kiểm tra hormone nữ, bạn cần xét nghiệm: FSH, LH, Estrogen, Progesterone, Testosterone. Thời điểm làm xét nghiệm thường vào ngày 2-5 của chu kỳ kinh nguyệt. Bác sĩ sẽ chỉ định cụ thể dựa trên tình trạng và mục đích kiểm tra của bạn.'
      },
      {
        question: 'Tôi bị rối loạn kinh nguyệt sau khi sinh. Khi nào chu kỳ sẽ ổn định lại?',
        reply:
          'Sau khi sinh, chu kỳ kinh nguyệt có thể mất 6-12 tháng để ổn định trở lại, đặc biệt nếu bạn cho con bú. Nếu sau 1 năm vẫn không đều, bạn nên khám phụ khoa để kiểm tra hormone và tìm nguyên nhân cụ thể.'
      },
      {
        question: 'Tôi muốn tìm hiểu về thụ tinh nhân tạo. Quy trình như thế nào?',
        reply:
          'Thụ tinh nhân tạo (IUI) là phương pháp hỗ trợ sinh sản. Quy trình: khám và đánh giá sức khỏe, kích thích buồng trứng, theo dõi rụng trứng, bơm tinh trùng vào tử cung. Tỷ lệ thành công khoảng 10-20% mỗi chu kỳ. Bạn nên khám chuyên khoa hiếm muộn để được tư vấn chi tiết.'
      },
      {
        question: 'Tôi bị đau khi quan hệ tình dục. Nguyên nhân có thể là gì?',
        reply:
          'Đau khi quan hệ tình dục có thể do nhiều nguyên nhân: viêm âm đạo, khô âm đạo, lạc nội mạc tử cung, u xơ tử cung, hoặc tâm lý. Bạn nên khám phụ khoa để được chẩn đoán chính xác và có phương pháp điều trị phù hợp.'
      },
      {
        question: 'Tôi muốn tìm hiểu về mãn kinh. Các triệu chứng và cách đối phó như thế nào?',
        reply:
          'Mãn kinh thường xảy ra ở độ tuổi 45-55. Triệu chứng: bốc hỏa, đổ mồ hôi đêm, khô âm đạo, thay đổi tâm trạng, mất ngủ. Cách đối phó: tập luyện, chế độ ăn lành mạnh, liệu pháp hormone (nếu cần), khám sức khỏe định kỳ.'
      }
    ]

    const questions = []
    const replies = []

    // Tạo 2 câu hỏi cho mỗi customer
    for (const customer of customers) {
      console.log(`Creating questions for customer: ${customer.full_name}`)

      for (let i = 0; i < 2; i++) {
        // Chọn ngẫu nhiên một template câu hỏi
        const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)]

        // Tạo câu hỏi
        const question = {
          content: template.question,
          status: true, // Đã được duyệt
          customer: customer
        }

        questions.push(question)
      }
    }

    // Lưu tất cả câu hỏi vào database
    const savedQuestions = await questionRepository.save(questions)
    console.log(`Created ${savedQuestions.length} questions`)

    // Tạo câu trả lời cho mỗi câu hỏi
    for (let i = 0; i < savedQuestions.length; i++) {
      const question = savedQuestions[i]
      const template = questionTemplates[i % questionTemplates.length]

      // Chọn ngẫu nhiên một consultant để trả lời
      const randomConsultant = consultants[Math.floor(Math.random() * consultants.length)]

      const reply = replyRepository.create({
        content: template.reply,
        consultant: randomConsultant,
        question: question
      })

      replies.push(reply)
    }

    // Lưu tất cả câu trả lời vào database
    const savedReplies = await replyRepository.save(replies)

    console.log(`✅ Successfully created ${savedQuestions.length} questions and ${savedReplies.length} replies`)
    console.log(`📊 Summary:`)
    console.log(`- ${customers.length} customers`)
    console.log(`- ${consultants.length} consultants`)
    console.log(`- ${savedQuestions.length} questions (2 per customer)`)
    console.log(`- ${savedReplies.length} replies (1 per question)`)

    // Thống kê consultant trả lời
    const consultantStats: { [key: string]: number } = {}
    savedReplies.forEach((reply) => {
      const consultantName = reply.consultant.full_name || 'Unknown'
      consultantStats[consultantName] = (consultantStats[consultantName] || 0) + 1
    })

    console.log('\n📋 Replies by consultant:')
    Object.entries(consultantStats).forEach(([name, count]) => {
      console.log(`- ${name}: ${count} replies`)
    })
  } catch (error) {
    console.error('❌ Error creating questions and replies:', error)
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
createQuestionsReplies()
