import { spawn } from 'child_process';
import path from 'path';

/**
 * IP-SAKTI Python Bridge
 * Bridges Express / React server routes to the dedicated Python RAG & AI Engine.
 */
export async function executePythonBackend<T = any>(
  command:
    | 'classify'
    | 'chat'
    | 'abs'
    | 'extract'
    | 'knowledge'
    | 'ip_analyze'
    | 'ip'
    | 'compliance'
    | 'compliance_analyze'
    | 'dossier'
    | 'dossier_create'
    | 'dossier_export'
    | 'facilitator_review'
    | 'review'
    | 'benchmark'
    | 'evaluate',
  payload: any = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const jsonStr = JSON.stringify(payload);

    // Spawn python3 -m src.ai.rag.main <command> <jsonStr>
    const pyProcess = spawn('python3', ['-m', 'src.ai.rag.main', command, jsonStr], {
      cwd,
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0 && !stdout.trim()) {
        console.error(`Python backend process exited with code ${code}:`, stderr);
        return reject(new Error(stderr || `Python backend process failed with exit code ${code}`));
      }

      try {
        const trimmed = stdout.trim();
        const jsonStart = trimmed.indexOf('{');
        const jsonArrayStart = trimmed.indexOf('[');
        let startIdx = -1;
        if (jsonStart !== -1 && jsonArrayStart !== -1) {
          startIdx = Math.min(jsonStart, jsonArrayStart);
        } else if (jsonStart !== -1) {
          startIdx = jsonStart;
        } else if (jsonArrayStart !== -1) {
          startIdx = jsonArrayStart;
        }

        const jsonToParse = startIdx !== -1 ? trimmed.slice(startIdx) : trimmed;
        const result = JSON.parse(jsonToParse);
        resolve(result);
      } catch (err) {
        console.error('Failed to parse Python JSON output:', stdout, err);
        reject(new Error('Invalid response from Python backend'));
      }
    });

    pyProcess.on('error', (err) => {
      console.error('Failed to spawn Python backend process:', err);
      reject(err);
    });
  });
}
