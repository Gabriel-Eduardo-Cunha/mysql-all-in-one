
import mysql from 'mysql2';

/**
 * Escapes a value into a valid mysql String representation
 */
export const escVal = mysql.escape;