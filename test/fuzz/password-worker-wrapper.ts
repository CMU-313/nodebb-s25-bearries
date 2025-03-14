import 'reflect-metadata';
import { fuzzMethod, fuzzArg } from 'fast-fuzz-shim';

// Since the original file registers functions with workerpool, 
// we'll create a wrapper that exposes those functions directly
export class PasswordWorkerWrapper {
  @fuzzMethod
  async hash(
    @fuzzArg('string') password: string,
    @fuzzArg('integer', 4, 14) rounds: number
  ): Promise<string> {
    // We need to mock this implementation since we can't directly call
    // the workerpool functions
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(parseInt(String(rounds), 10));
    return await bcrypt.hash(password, salt);
  }
  
  @fuzzMethod
  async compare(
    @fuzzArg('string') password: string,
    @fuzzArg('string') hash: string
  ): Promise<boolean> {
    // Mock implementation
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(String(password || ''), String(hash || ''));
  }
}
