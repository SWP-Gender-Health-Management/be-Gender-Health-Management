import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import Question from '../models/Entity/question.entity.js'
import Reply from '../models/Entity/reply.entity.js'
import { Role } from '../enum/role.enum.js'

const CUSTOMER_ID = '2e7f0017-083d-4b04-8cb7-693723d99c96'
const NUM_QUESTIONS = 9
const NUM_REPLIES = 6

async function main() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const questionRepository = AppDataSource.getRepository(Question)
    const replyRepository = AppDataSource.getRepository(Reply)

    // Lấy customer
    const customer = await accountRepository.findOne({ where: { account_id: CUSTOMER_ID } })
    if (!customer) {
      console.error('❌ Customer not found')
      return
    }

    // Lấy danh sách consultant
    const consultants = await accountRepository.find({ where: { role: Role.CONSULTANT } })
    if (consultants.length === 0) {
      console.error('❌ No consultants found')
      return
    }

    // Template câu hỏi và trả lời
    const questionTemplates = [
      {
        question: 'Sử dụng bao cao su có an toàn tuyệt đối không?',
        reply:
          'Bao cao su có hiệu quả rất cao (khoảng 98%) trong việc phòng tránh thai và các bệnh lây truyền qua đường tình dục (STIs) khi được sử dụng đúng cách. Tuy nhiên, không có phương pháp nào là an toàn tuyệt đối 100%.'
      },
      {
        question: 'HPV là gì và có nguy hiểm không?',
        reply:
          'HPV (Human Papillomavirus) là một loại virus rất phổ biến lây qua đường tình dục. Hầu hết các trường hợp nhiễm HPV sẽ tự khỏi, nhưng một số type nguy cơ cao có thể gây ra các vấn đề sức khỏe nghiêm trọng như ung thư cổ tử cung, vì vậy việc tiêm phòng vaccine HPV là rất được khuyến khích.'
      },
      {
        question: 'Làm thế nào để biết mình có mắc bệnh lây truyền qua đường tình dục (STI) hay không?',
        reply:
          'Nhiều bệnh STIs không có triệu chứng rõ ràng. Cách duy nhất để biết chắc chắn là đi xét nghiệm. Bạn nên đi khám định kỳ hoặc khi có bất kỳ dấu hiệu bất thường nào sau khi quan hệ tình dục không an toàn.'
      },
      {
        question: 'Thuốc tránh thai khẩn cấp có nên được sử dụng thường xuyên không?',
        reply:
          'Không nên. Thuốc tránh thai khẩn cấp chỉ nên được sử dụng trong các trường hợp "khẩn cấp" và không nên dùng thay thế cho các biện pháp tránh thai hàng ngày vì nó chứa liều lượng hormone cao, có thể gây ra các tác dụng phụ và ảnh hưởng đến chu kỳ kinh nguyệt.'
      },
      {
        question: 'Quan hệ tình dục bằng miệng có an toàn không?',
        reply:
          'Quan hệ tình dục bằng miệng vẫn có nguy cơ lây truyền một số bệnh STIs như lậu, giang mai, herpes và HPV. Sử dụng các biện pháp bảo vệ như bao cao su hoặc màng chắn miệng (dental dam) có thể giúp giảm thiểu rủi ro này.'
      },
      {
        question: 'Chu kỳ kinh nguyệt không đều có phải là một vấn đề nghiêm trọng?',
        reply:
          'Chu kỳ không đều có thể do nhiều nguyên nhân như stress, thay đổi cân nặng, hoặc một số tình trạng bệnh lý (ví dụ: PCOS). Nếu tình trạng này kéo dài, bạn nên đi khám bác sĩ để được tư vấn và tìm ra nguyên nhân chính xác.'
      },
      {
        question: 'Tự khám vú tại nhà có quan trọng không?',
        reply:
          'Rất quan trọng. Tự khám vú hàng tháng giúp bạn làm quen với cơ thể mình và sớm phát hiện bất kỳ thay đổi bất thường nào (như khối u, sự thay đổi ở da hoặc núm vú), từ đó có thể đi khám và chẩn đoán sớm.'
      },
      {
        question: 'Bao lâu thì nên đi xét nghiệm STIs một lần?',
        reply:
          'Tần suất xét nghiệm phụ thuộc vào mức độ hoạt động tình dục của bạn. Các chuyên gia thường khuyên nên xét nghiệm ít nhất một lần mỗi năm nếu bạn có quan hệ tình dục, hoặc thường xuyên hơn nếu bạn có nhiều bạn tình hoặc có quan hệ không an toàn.'
      },
      {
        question: 'Rửa vùng kín ngay sau khi quan hệ có giúp tránh thai hoặc STIs không?',
        reply:
          'Không. Việc thụt rửa hoặc vệ sinh ngay lập tức không có tác dụng tránh thai vì tinh trùng di chuyển rất nhanh. Nó cũng không thể loại bỏ hoàn toàn các mầm bệnh STIs và thậm chí có thể gây kích ứng hoặc làm tăng nguy cơ nhiễm trùng.'
      },
      {
        question: 'Các biện pháp tránh thai hiệu quả nhất là gì?',
        reply:
          'Các biện pháp có hiệu quả cao nhất bao gồm vòng tránh thai (IUD) và que cấy tránh thai. Các biện pháp khác như thuốc tránh thai hàng ngày, bao cao su, và miếng dán tránh thai cũng rất hiệu quả nếu được sử dụng một cách chính xác và đều đặn.'
      }
    ]

    // 1. Tạo 9 câu hỏi cho customer này
    const questions = []
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)]
      questions.push({
        content: template.question,
        status: true,
        customer: customer
      })
    }
    const savedQuestions = await questionRepository.save(questions)
    console.log(`Created ${savedQuestions.length} questions for customer ${customer.full_name}`)

    // 2. Chọn ngẫu nhiên 6 câu hỏi để tạo reply
    const shuffled = savedQuestions.sort(() => 0.5 - Math.random())
    const questionsForReply = shuffled.slice(0, NUM_REPLIES)
    const replies = []
    for (const question of questionsForReply) {
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)]
      const consultant = consultants[Math.floor(Math.random() * consultants.length)]
      const reply = replyRepository.create({
        content: template.reply,
        consultant: consultant,
        question: question
      })
      replies.push(reply)
    }
    const savedReplies = await replyRepository.save(replies)
    console.log(`Created ${savedReplies.length} replies for 6 random questions`)

    // 3. Log mapping reply <-> question
    savedReplies.forEach((reply, idx) => {
      console.log(`Reply ${idx + 1}: reply_id=${reply.reply_id}, question_id=${reply.question.ques_id}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

main()
