import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../db/store.js';

export async function getUsers(req: Request, res: Response) {
  try {
    const list = store.users.map(({ password, ...u }) => u);
    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const exists = store.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      department: department || 'Operations',
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);
    const { password: _, ...cleanUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: cleanUser
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.users.findIndex(u => u._id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existing = store.users[index];
    let updatedPassword = existing.password;

    if (req.body.password && req.body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updatedPassword = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = {
      ...existing,
      name: req.body.name || existing.name,
      email: req.body.email ? req.body.email.toLowerCase() : existing.email,
      role: req.body.role || existing.role,
      department: req.body.department || existing.department,
      password: updatedPassword
    };

    store.users[index] = updatedUser;
    const { password: _, ...cleanUser } = updatedUser;

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: cleanUser
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.users.findIndex(u => u._id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = store.users[index];
    if (user.email === 'admin@solarfarm.com') {
      return res.status(400).json({ success: false, message: 'Primary demo admin cannot be deleted' });
    }

    const deleted = store.users.splice(index, 1)[0];
    const { password: _, ...cleanUser } = deleted;

    return res.json({
      success: true,
      message: `User ${cleanUser.name} deleted`,
      data: cleanUser
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
