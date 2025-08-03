import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { BLOG_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Blog from '../models/Entity/blog.entity.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import LIMIT from '~/constants/limit.js'
import { Major } from '~/enum/major.enum.js'

const blogRepository = AppDataSource.getRepository(Blog)
const accountRepository = AppDataSource.getRepository(Account)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export class BlogService {
  // Hàm hỗ trợ chuyển đường dẫn cục bộ thành URL
  private toImageUrl(localPath: string): string {
    // localPath đã là dạng uploads/blog_images/..., chỉ cần thêm BASE_URL
    return `${BASE_URL}/${localPath.replace(/\\/g, '/')}`
  }

  // Create a new blog
  async createBlog(data: any, files: Express.Multer.File[]): Promise<Blog> {
    // Validate account
    const account = await accountRepository.findOne({ where: { account_id: data.account_id } })
    if (!account) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.ACCOUNT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate required fields
    if (!data.title || data.title.trim() === '') {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.TITLE_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    if (!data.content || data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    if (!data.major) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.MAJOR_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Generate blog_id
    const blogId = uuidv4()

    // Process images
    let images: string[] = []
    if (files && files.length > 0) {
      images = await Promise.all(
        files.map(async (file) => {
          const oldPath = file.path
          const ext = path.extname(oldPath)
          const newFileName = `blog_${blogId}_${uuidv4()}${ext}`
          const newPath = path.join(path.dirname(oldPath), newFileName)
          // Lưu đường dẫn tương đối vào database
          const relativePath = `uploads/blog_images/${newFileName}`
          console.log('Renaming file from:', oldPath, 'to:', newPath) // Log để debug
          try {
            await fs.rename(oldPath, newPath)
            return relativePath
          } catch (err) {
            const error = err as NodeJS.ErrnoException
            throw new ErrorWithStatus({
              message: `Failed to rename image: ${error.message}`,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        })
      )
    }

    const blog = blogRepository.create({
      blog_id: blogId,
      account,
      major: data.major,
      title: data.title,
      content: data.content,
      status: data.status === 'true' || data.status === true,
      images
    })

    const savedBlog = await blogRepository.save(blog)
    // Chuyển đổi images thành URL trong response
    savedBlog.images = savedBlog.images?.map((img) => this.toImageUrl(img)) || []
    return savedBlog
  }

  // Get all blogs
  async getAllBlogs(pageVar: { limit: string; page: string }): Promise<Blog[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default
    let page = parseInt(pageVar.page) || 1
    const skip = (page - 1) * limit
    const blogs = await blogRepository.find({
      skip,
      take: limit,
      relations: ['account']
    })

    // Chuyển đổi images thành URL
    return blogs.map((blog) => ({
      ...blog,
      images: blog.images?.map((img) => this.toImageUrl(img)) || []
    }))
  }

  // Get a blog by ID
  async getBlogById(blog_id: string): Promise<Blog> {
    const blog = await blogRepository.findOne({
      where: { blog_id },
      relations: ['account']
    })

    if (!blog) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.BLOG_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Chuyển đổi images thành URL
    blog.images = blog.images?.map((img) => this.toImageUrl(img)) || []
    return blog
  }

  // Get blogs by Account ID
  async getBlogsByAccountId(account_id: string, pageVar: { limit: string; page: string }): Promise<Blog[]> {
    const account = await accountRepository.findOne({ where: { account_id } })
    if (!account) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.ACCOUNT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let limit = parseInt(pageVar.limit) || LIMIT.default
    let page = parseInt(pageVar.page) || 1
    const skip = (page - 1) * limit

    const blogs = await blogRepository.find({
      where: { account: { account_id: account.account_id } },
      skip,
      take: limit,
      relations: ['account']
    })

    // if (!blogs) {
    //   throw new ErrorWithStatus({
    //     message: BLOG_MESSAGES.BLOG_NOT_FOUND,
    //     status: HTTP_STATUS.NOT_FOUND
    //   })
    // }

    // Chuyển đổi images thành URL
    return blogs.map((blog) => ({
      ...blog,
      images: blog.images?.map((img) => this.toImageUrl(img)) || []
    }))
  }

  // Update a blog
  async updateBlog(blog_id: string, data: any, files: Express.Multer.File[]): Promise<Blog> {
    const blog = await this.getBlogById(blog_id)

    // Validate account if provided
    let account
    if (data.account_id && data.account_id !== blog.account.account_id) {
      account = await accountRepository.findOne({ where: { account_id: data.account_id } })
      if (!account) {
        throw new ErrorWithStatus({
          message: BLOG_MESSAGES.ACCOUNT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate required fields if provided
    if (data.title && data.title.trim() === '') {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.TITLE_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    if (data.content && data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Process images
    let images = blog.images || []
    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const oldPath = file.path
          const ext = path.extname(oldPath)
          const newFileName = `blog_${blog_id}_${uuidv4()}${ext}`
          const newPath = path.join(path.dirname(oldPath), newFileName)
          // Lưu đường dẫn tương đối vào database
          const relativePath = `uploads/blog_images/${newFileName}`
          try {
            await fs.rename(oldPath, newPath)
            return relativePath
          } catch (err) {
            const error = err as NodeJS.ErrnoException
            throw new ErrorWithStatus({
              message: `Failed to rename image: ${error.message}`,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        })
      )
      images = data.replaceImages === 'true' ? newImages : [...images, ...newImages]
      // Delete old images if replacing
      if (data.replaceImages === 'true' && blog.images && blog.images.length > 0) {
        for (const imagePath of blog.images) {
          // Chuyển relative path thành absolute path để xóa
          const absolutePath = path.join(process.cwd(), imagePath)
          console.log('Deleting old image:', absolutePath) // Log để debug
          try {
            await fs.unlink(absolutePath)
          } catch (err) {
            const error = err as NodeJS.ErrnoException
            if (error.code !== 'ENOENT') {
              throw new ErrorWithStatus({
                message: `Failed to delete image: ${error.message}`,
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR
              })
            }
          }
        }
      }
    }

    Object.assign(blog, {
      account: account || blog.account,
      major: data.content && data.content.trim() === '' ? data.major : blog.major,
      title: data.title || blog.title,
      content: data.content || blog.content,
      status: data.status !== undefined ? data.status === 'true' || data.status === true : blog.status,
      images
    })

    const updatedBlog = await blogRepository.save(blog)
    // Chuyển đổi images thành URL trong response
    updatedBlog.images = updatedBlog.images?.map((img) => this.toImageUrl(img)) || []
    return updatedBlog
  }

  // Delete a blog
  async deleteBlog(blog_id: string): Promise<void> {
    const blog = await this.getBlogById(blog_id)

    // Delete associated images
    if (blog.images && blog.images.length > 0) {
      for (const imagePath of blog.images) {
        try {
          await fs.unlink(imagePath)
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw new ErrorWithStatus({
              message: `Failed to delete image: ${error.message}`,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        }
      }
    }

    // Delete the blog
    await blogRepository.remove(blog)
  }

  async getMajor(): Promise<string[]> {
    return Object.values(Major).map((major) => major.toString())
  }
}

const blogService = new BlogService()
export default blogService
