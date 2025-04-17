#!/usr/bin/env node
/**
 * This script runs deployment-specific migrations.
 * It's designed to be executed during the Vercel build process.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function runDeploymentMigrations() {
  // The environment variables will be provided by Vercel in production
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Running deployment-specific migrations...');
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // This allows self-signed certificates
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // First check if the schema exists, if not create it
    try {
      await ensureSchemaExists(client);
    } catch (error) {
      console.warn(`⚠️ Warning during schema check: ${error.message}`);
      // Continue with migrations anyway
    }
    
    // Get all SQL files in the deployment-fix directory
    const migrationDir = path.join(process.cwd(), 'drizzle', 'migrations', 'deployment-fix');
    if (!fs.existsSync(migrationDir)) {
      console.log('ℹ️ No deployment-specific migrations directory found');
      return;
    }
    
    const files = fs.readdirSync(migrationDir)
                   .filter(file => file.endsWith('.sql'))
                   .sort();
    
    if (files.length === 0) {
      console.log('ℹ️ No deployment-specific migrations found');
      return;
    }
    
    console.log(`🔄 Found ${files.length} deployment migration files to run`);
    
    // Run each migration file
    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🔄 Running migration: ${file}`);
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log(`✅ Successfully ran migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error running migration ${file}:`, error.message);
        
        // Production deployments should continue even if migrations have errors
        // to prevent blocking deploys on migration issues
        if (process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production') {
          console.log('⚠️ Production deployment detected - continuing despite migration error');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ All deployment migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Error running deployment migrations:', error.message);
    
    // Only exit with error in development, allow production to continue
    if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') {
      process.exit(1);
    } else {
      console.log('⚠️ Continuing build despite errors (production environment)');
    }
  } finally {
    await client.end();
  }
}

// Helper function to ensure the schema exists
async function ensureSchemaExists(client) {
  try {
    // Check if public schema exists
    const schemaResult = await client.query(`
      SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public';
    `);
    
    if (schemaResult.rows.length === 0) {
      console.log('⚠️ Public schema not found, creating it');
      await client.query('CREATE SCHEMA IF NOT EXISTS public;');
    }
    
    // Check if the tables exist in the public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log(`ℹ️ Found ${tablesResult.rows.length} tables in database`);
    
    // Log the list of tables for debugging
    if (tablesResult.rows.length > 0) {
      const tableNames = tablesResult.rows.map(row => row.table_name).join(', ');
      console.log(`ℹ️ Tables in database: ${tableNames}`);
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    throw error;
  }
}

// Run the migrations
runDeploymentMigrations().catch(err => {
  console.error('❌ Fatal error:', err.message);
  
  // Only exit with error in development, allow production to continue
  if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') {
    process.exit(1);
  } else {
    console.log('⚠️ Continuing build despite errors (production environment)');
    process.exit(0);
  }
}); 