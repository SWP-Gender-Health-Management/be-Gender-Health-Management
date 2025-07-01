import { Router } from 'express'
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByAccountId,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { uploadBlogImages as uploadBlogImagesMiddleware } from '../config/multer.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const blogRoute = Router()

/*
  Description: Create a new blog with images (consultant only)
  Method: POST
  Path: /create-blog
  Body: Form-data {
    account_id: string,
    major: string,
    title: string,
    content: string,
    status: boolean,
    images: file[]
  }
*/
blogRoute.post(
  '/create-blog',
  // validateAccessToken,
  // restrictTo(Role.CONSULTANT),
  uploadBlogImagesMiddleware.array('images', 10),
  wrapRequestHandler(createBlog)
)

/*
  Description: Get all blogs (admin, consultant, or customer)
  Method: GET
  Path: /get-all-blogs
  Body: {}
*/
blogRoute.get(
  '/get-all-blogs',
//   validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getAllBlogs)
)

/*
  Description: Get a blog by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-blog-by-id/:blog_id
  Body: {}
*/
blogRoute.get(
  '/get-blog-by-id/:blog_id',
  // validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getBlogById)
)

/*
  Description: Get blogs by account ID (admin or consultant)
  Method: GET
  Path: /get-blog-by-account/:account_id
  Body: {}
*/
blogRoute.get(
  '/get-blog-by-account/:account_id',
  // validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.STAFF),
  wrapRequestHandler(getBlogsByAccountId)
)

/*
  Description: Update a blog with images (consultant only)
  Method: PUT
  Path: /update-blog/:blog_id
  Body: Form-data {
    account_id?: string,
    major?: string,
    title?: string,
    content?: string,
    status?: boolean,
    replaceImages?: boolean,
    images?: file[]
  }
*/
blogRoute.put(
  '/update-blog/:blog_id',
  // validateAccessToken,
  restrictTo(Role.CONSULTANT),
  uploadBlogImagesMiddleware.array('images', 10),
  wrapRequestHandler(updateBlog)
)

/*
  Description: Delete a blog (admin or consultant)
  Method: DELETE
  Path: /delete-blog/:blog_id
  Body: {}
*/
blogRoute.delete(
  '/delete-blog/:blog_id',
  // validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(deleteBlog)
)

export default blogRoute