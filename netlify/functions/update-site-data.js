const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  // Habilitar CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN no está configurado en las variables de entorno');
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: "Token de GitHub no configurado en variables de entorno de Netlify" })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
    console.log('Datos recibidos para actualizar:', Object.keys(data));
  } catch (err) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: "JSON inválido", details: err.message })
    };
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const owner = "AdrianCrea038";
  const repo = "leash-to-legacy";
  const path = "site-data.json";
  const branch = "main";
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  try {
    let sha = null;
    try {
      const { data: file } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });
      sha = file.sha;
    } catch (err) {
      const notFound = err.status === 404 || err.response?.status === 404;
      if (!notFound) throw err;
      // Archivo no existe aún, se creará sin sha
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Actualización desde panel de administración",
      content,
      ...(sha && { sha }),
      branch,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Archivo actualizado en GitHub" }),
    };
  } catch (error) {
    console.error('Error en update-site-data:', error);
    console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Extraer información útil del error
    let errorMessage = error.message || 'Error desconocido';
    let errorDetails = null;
    
    if (error.response) {
      errorDetails = error.response.data;
      errorMessage = error.response.data?.message || error.message;
      console.error('Error de GitHub API:', error.response.status, error.response.data);
    } else if (error.status) {
      errorMessage = `Error ${error.status}: ${error.message}`;
      errorDetails = error;
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: errorDetails || error.stack,
        type: error.name || 'UnknownError'
      }),
    };
  }
};