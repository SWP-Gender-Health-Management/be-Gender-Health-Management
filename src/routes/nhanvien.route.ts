import { Router } from 'express'
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByAccountId,
  updateBlog,
  deleteBlog,
  getMajor
} from '../controllers/blog.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { uploadBlogImages as uploadBlogImagesMiddleware } from '../config/multer.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'
import { createNV, getAllNV, getByID ,update, deleteNV} from '~/controllers/nhanvien.controller.js'

const nvRoute = Router()

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
nvRoute.post(
  '/create-nv',

  wrapRequestHandler(createNV)
)

/*
  Description: Get all blogs (admin, consultant, or customer)
  Method: GET
  Path: /get-all-blogs
  Body: {}
*/
nvRoute.get('/get-all-nv', wrapRequestHandler(getAllNV))


/*
  Description: Get a blog by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-blog-by-id/:blog_id
  Body: {}
*/
nvRoute.get(
  '/get-nv-by-id/:id',
  // validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getByID)
)

/*

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
nvRoute.put(
  '/update-nv/:id',

  wrapRequestHandler(update)
)

/*
  Description: Delete a blog (admin or consultant)
  Method: DELETE
  Path: /delete-blog/:blog_id
  Body: {}
*/
nvRoute.delete(
  '/delete-nv/:id',

  wrapRequestHandler(deleteNV)
)



export default nvRoute

