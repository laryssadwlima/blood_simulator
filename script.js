document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('formulario');
  const resultado = document.getElementById('resultado');
  const labelMeses = document.getElementById('labelMeses');
  const inputMeses = document.getElementById('meses');
  const checkboxNuncaDoou = document.getElementById('nuncaDoou');

  checkboxNuncaDoou.addEventListener('change', function() {
    if (this.value === 'nao') {
      labelMeses.style.display = 'flex';
      inputMeses.required = true;
    } else {
      labelMeses.style.display = 'none';
      inputMeses.required = false;
      inputMeses.value = '';
    }
  });

  if (checkboxNuncaDoou.value === 'nao') {
    labelMeses.style.display = 'flex';
    inputMeses.required = true;
  } else {
    labelMeses.style.display = 'none';
    inputMeses.required = false;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const idade = parseInt(document.getElementById('idade').value);
    const peso = parseFloat(document.getElementById('peso').value);
    const genero = document.getElementById('genero').value;
    const doente = document.getElementById('doente').value;
    const gestante = document.getElementById('gestante').value;
    const tatuagem = document.getElementById('tatuagem').value;
    const cirurgia = document.getElementById('cirurgia').value;
    const vacina = document.getElementById('vacina').value;
    const alcool = document.getElementById('alcool').value;
    const sono = document.getElementById('sono').value;
    const nuncaDoou = document.getElementById('nuncaDoou').checked;
    const meses = nuncaDoou ? 0 : parseInt(document.getElementById('meses').value);

    let mensagens = [];
    let apto = true;

    // Verificação de idade
    if (idade < 16) {
      mensagens.push("❌ Você precisa ter pelo menos 16 anos para doar sangue.");
      apto = false;
    } else if (idade > 69) {
      mensagens.push("❌ Pessoas com mais de 69 anos não podem doar sangue.");
      apto = false;
    }

    // Verificação de peso
    if (peso < 50) {
      mensagens.push("❌ Você precisa pesar pelo menos 50kg para doar sangue.");
      apto = false;
    }

    // Verificação de saúde
    if (doente === 'sim') {
      mensagens.push("❌ Você não pode doar sangue estando doente ou com febre/gripe nos últimos 7 dias.");
      apto = false;
    }

    // Verificação de gestação
    if (gestante === 'sim') {
      mensagens.push("❌ Grávidas ou mulheres amamentando não podem doar sangue.");
      apto = false;
    }

    // Verificação de tatuagem/piercing
    if (tatuagem === 'sim') {
      mensagens.push("❌ Você precisa aguardar 12 meses após fazer tatuagem, piercing ou acupuntura.");
      apto = false;
    }

    // Verificação de cirurgia
    if (cirurgia === 'sim') {
      mensagens.push("❌ Você precisa aguardar 6 meses após uma cirurgia.");
      apto = false;
    }

    // Verificação de vacina
    if (vacina === 'sim') {
      mensagens.push("❌ Você precisa aguardar 30 dias após tomar vacinas.");
      apto = false;
    }

    // Verificação de álcool
    if (alcool === 'sim') {
      mensagens.push("❌ Você precisa aguardar 12 horas após ingerir bebida alcoólica.");
      apto = false;
    }

    // Verificação de sono
    if (sono === 'nao') {
      mensagens.push("❌ Você precisa ter dormido pelo menos 6 horas nas últimas 24 horas.");
      apto = false;
    }

    // Verificação de intervalo entre doações
    if (!nuncaDoou) {
      if (genero === 'masculino' && meses < 60) {
        mensagens.push("❌ Homens precisam aguardar 60 dias entre as doações.");
        apto = false;
      } else if (genero === 'feminino' && meses < 90) {
        mensagens.push("❌ Mulheres precisam aguardar 90 dias entre as doações.");
        apto = false;
      }
    }

    if (apto) {
      resultado.innerHTML = `
        <div style="color: #28a745; font-size: 1.2em; margin-bottom: 15px;">
          ✅ Você está apto(a) para doar sangue!
        </div>
        <div style="color: #666; font-size: 0.9em;">
          Lembre-se de levar um documento oficial com foto e não estar em jejum.
        </div>
      `;
    } else {
      resultado.innerHTML = `
        <div style="color: #dc3545; font-size: 1.2em; margin-bottom: 15px;">
          ❌ Você não está apto(a) para doar sangue no momento.
        </div>
        <div style="color: #666; font-size: 0.9em;">
          <strong>Motivos:</strong>
          <ul style="text-align: left; margin-top: 10px;">
            ${mensagens.map(msg => `<li>${msg}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  });
});
