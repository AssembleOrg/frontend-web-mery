// db simulation mockup
const userAccessDB: { [email: string]: string[] } = {
  'test@example.com': ['introduccion-al-nanoblading'],
};

/**
 * @param userEmail El email del usuario que compró.
 * @param courseIds Un array con los IDs de los cursos comprados.
 */
export async function grantCourseAccess(
  userEmail: string,
  courseIds: string[]
): Promise<void> {
  console.log(
    `[DB SIM] Intentando dar acceso a ${userEmail} para los cursos:`,
    courseIds
  );

  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!userAccessDB[userEmail]) {
    userAccessDB[userEmail] = [];
    console.log(`[DB SIM] Usuario nuevo creado: ${userEmail}`);
  }

  courseIds.forEach((courseId) => {
    if (!userAccessDB[userEmail].includes(courseId)) {
      userAccessDB[userEmail].push(courseId);
      console.log(`[DB SIM] Acceso concedido para el curso: ${courseId}`);
    } else {
      console.log(`[DB SIM] El usuario ya tenía acceso al curso: ${courseId}`);
    }
  });

  console.log(
    `[DB SIM] Estado final de acceso para ${userEmail}:`,
    userAccessDB[userEmail]
  );
}
