export const MAX_NAME = 15;
export const MAX_SKILLS = 50;
export const MAX_DESC = 300;

// filo limitai
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB pavertus baitais
export const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1 MB for logos


export function validateFile(name, file, setErrors) {
  if (!file) return true;

  // CV-specific checks
  if (name === 'CV') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Netinkamas CV formato tipas' }));
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const mb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      setErrors(prev => ({ ...prev, [name]: `Failas per didelis — maksimalus dydis ${mb}MB` }));
      return false;
    }
  }

  // logo tkrinimas
  if (name === 'logotipo_failo') {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedImageTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Netinkamas logotipo formato tipas' }));
      return false;
    }

    if (file.size > MAX_LOGO_SIZE) {
      const mb = (MAX_LOGO_SIZE / (1024 * 1024)).toFixed(0);
      setErrors(prev => ({ ...prev, [name]: `Logotipo failas per didelis — maksimalus dydis ${mb}MB` }));
      return false;
    }
  }


  setErrors(prev => ({ ...prev, [name]: '' }));
  return true;
}

/*
- apkarpo vertes, viršijančias ribas.
- nustato su ilgiu susijusią klaidą (per „setErrors“), kai atliekamas apkarpymas.
- nustato klaidą „nėra tarpų“ vardams/pavarde, kai yra tarpas.
*/
export function enforceLimits(name, value, setErrors) {
  if (value == null) return value;

  let newValue = value;

  // no spaces for names
  if ((name === 'vardas' || name === 'pavarde') && newValue.includes(' ')) {
    setErrors(prev => ({ ...prev, [name]: 'Negalima naudoti tarpų' }));
  }

  if (name === 'vardas' || name === 'pavarde') {
    if (newValue.length > MAX_NAME) {
      newValue = newValue.slice(0, MAX_NAME);
      setErrors(prev => ({ ...prev, [name]: `Ne daugiau nei ${MAX_NAME} simbolių` }));
    }
  } else if (name === 'igudziai') {
    if (newValue.length > MAX_SKILLS) {
      newValue = newValue.slice(0, MAX_SKILLS);
      setErrors(prev => ({ ...prev, [name]: `Ne daugiau nei ${MAX_SKILLS} simbolių` }));
    }
  } else if (name === 'aprasymas') {
    if (newValue.length > MAX_DESC) {
      newValue = newValue.slice(0, MAX_DESC);
      setErrors(prev => ({ ...prev, [name]: `Ne daugiau nei ${MAX_DESC} simbolių` }));
    }
  } else if (name === 'pavadinimas') {

    if (newValue.length > MAX_NAME) {
      newValue = newValue.slice(0, MAX_NAME);
      setErrors(prev => ({ ...prev, [name]: `Ne daugiau nei ${MAX_NAME} simbolių` }));
    }
  }

  return newValue;
}

export default enforceLimits;
