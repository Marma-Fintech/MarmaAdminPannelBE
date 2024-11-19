const Employee = require('../models/employeeModel')
const bcrypt = require('bcrypt')
const { addToBlacklist, isTokenBlacklisted } = require('../utils/tokenHandler')
const { verifyToken, createToken } = require('../utils/token')
const { COOKIE_OPTIONS } = require('../utils/cookie')

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email })
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new employee
    const employee = new Employee({ name, email, password: hashedPassword })
    await employee.save()

    res.status(201).json({ message: 'Signup successful', employee })
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Failed to signup',
        error: error.message || 'Internal Server Error'
      })
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const employee = await Employee.findOne({ email })
    if (!employee) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Validate password
    const isPasswordValid = bcrypt.compare(password, employee.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = await createToken({ id: user._id })

    // Set the userId in a cookie
    res.cookie('id', employee._id.toString(), COOKIE_OPTIONS) // Use employee instead of user
    res.cookie('token', token.toString(), COOKIE_OPTIONS)

    res.status(200).json({ message: 'Login successful', token })
  } catch (error) {
    console.error('Error during login:', error)
    res
      .status(500)
      .json({
        message: 'Failed to login',
        error: error.message || 'Internal Server Error'
      })
  }
}

const signOut = async (req, res, next) => {
  try {
    const token = req.cookies.token

    // Check if the token is already blacklisted
    if (await isTokenBlacklisted(token)) {
      res.status(401).send({ message: 'Token is already blacklisted' })
      return
    }

    // Add the token to the blacklist
    await addToBlacklist(token)
    res.clearCookie('id')
    res.clearCookie('token')

    res.status(201).send({ message: 'User logged out successfully' })
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body

    // Check if user exists
    const employee = await Employee.findOne({ email })
    if (!employee) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    employee.password = hashedPassword
    await employee.save()

    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res
      .status(500)
      .json({
        message: 'Failed to reset password',
        error: error.message || 'Internal Server Error'
      })
  }
}

const protect = async (req, res, next) => {
  let token
  try {
    // Check if the Authorization header contains a Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]

      // Check if the token is blacklisted
      if (await isTokenBlacklisted(token)) {
        return res
          .status(401)
          .send({ message: 'Unauthorized - Token blacklisted' })
      }

      // Verify the token
      const decoded = verifyToken(token) // Use verifyToken function from jwt

      // Check again after decoding if the token is blacklisted
      if (await isTokenBlacklisted(token)) {
        return res
          .status(401)
          .send({ message: 'Unauthorized - Token blacklisted' })
      }

      // Attach user to request object (excluding password)
      req.user = await Employee.findById(decoded.id).select('-password')

      next() // Pass control to the next middleware
    }
  } catch (error) {
    console.error('Error in protect middleware:', error.message)
    return res
      .status(401)
      .send({ message: 'Unauthorized - Token verification failed' })
  }
}

module.exports = { signup, login, signOut, forgotPassword, protect }
