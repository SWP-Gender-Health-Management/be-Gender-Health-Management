import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { BLOG_MESSAGES } from '../constants/message.js'
import blogService from '../services/blog.service.js'

/**
 * @swagger
 * /blog/create-blog:
 *   post:
 *     summary: Create a new blog
 *     description: Creates a blog with images for an account. Requires consultant role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The account ID (UUID)
 *               major:
 *                 type: string
 *                 description: The major category of the blog
 *               title:
 *                 type: string
 *                 description: The blog title
 *               content:
 *                 type: string
 *                 description: The blog content
 *               status:
 *                 type: boolean
 *                 description: Blog status (published or not)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The images to upload
 *             required: [account_id, major, title, content]
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Bad request (e.g., title or content required)
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (account not found)
 */
export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.createBlog(req.body, req.files as Express.Multer.File[])
    res.status(HTTP_STATUS.CREATED).json({
      message: BLOG_MESSAGES.BLOG_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /blog/get-all-blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieves a list of all blogs with their relations (account). Requires admin, consultant, or customer role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {limit, page} = req.query;
    const pageVar = {
      limit: limit as string, 
      page: page as string
    };
    const result = await blogService.getAllBlogs(pageVar)
    res.status(HTTP_STATUS.OK).json({
      message: BLOG_MESSAGES.BLOGS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /blog/get-blog-by-id/{blog_id}:
 *   get:
 *     summary: Get a blog by ID
 *     description: Retrieves a blog by its ID with its relations (account). Requires admin, consultant, or customer role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID (UUID)
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (blog not found)
 */
export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.getBlogById(req.params.blog_id)
    res.status(HTTP_STATUS.OK).json({
      message: BLOG_MESSAGES.BLOG_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /blog/get-blog-by-account/{account_id}:
 *   get:
 *     summary: Get blogs by account ID
 *     description: Retrieves all blogs associated with an account ID with their relations (account). Requires admin or consultant role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: account_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID (UUID)
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (account or blogs not found)
 */
export const getBlogsByAccountId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {limit, page} = req.query;
    const pageVar = {
      limit: limit as string, 
      page: page as string
    };
    const result = await blogService.getBlogsByAccountId(req.params.account_id, pageVar)
    res.status(HTTP_STATUS.OK).json({
      message: BLOG_MESSAGES.BLOGS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /blog/update-blog/{blog_id}:
 *   put:
 *     summary: Update a blog
 *     description: Updates an existing blog with optional images. Requires consultant role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The account ID (UUID)
 *               major:
 *                 type: string
 *                 description: The major category of the blog
 *               title:
 *                 type: string
 *                 description: The blog title
 *               content:
 *                 type: string
 *                 description: The blog content
 *               status:
 *                 type: boolean
 *                 description: Blog status (published or not)
 *               replaceImages:
 *                 type: boolean
 *                 description: If true, replace existing images with new ones
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The images to upload
 *             required: []
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Bad request (e.g., title or content required)
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (blog or account not found)
 */
export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.updateBlog(req.params.blog_id, req.body, req.files as Express.Multer.File[])
    res.status(HTTP_STATUS.OK).json({
      message: BLOG_MESSAGES.BLOG_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /blog/delete-blog/{blog_id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Deletes a blog by its ID. Requires admin or consultant role.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blog_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID (UUID)
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (blog not found)
 */
export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await blogService.deleteBlog(req.params.blog_id)
    res.status(HTTP_STATUS.OK).json({
      message: BLOG_MESSAGES.BLOG_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}