const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Token de GitHub no configurado" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // ===== DATOS DE TU NUEVO REPOSITORIO =====
  const owner = "leashtolegacy";        // ← CAMBIADO
  const repo = "leash-to-legacy";       // ← CAMBIADO
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
      // Archivo no existe, se creará nuevo
      console.log("Archivo no existe, se creará uno nuevo");
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
    console.error("Error en GitHub:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
