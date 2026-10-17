# Familia-Medina-Rally-2026

Proyecto del Rally de Innovación para la reutilización de aceite doméstico. La página informa sobre la iniciativa y permite registrar entregas en puntos de acopio.

## Evidencia y revisión de entregas

1. La persona registra una entrega desde su cuenta y sube una foto de la cartilla. Se aceptan imágenes JPEG, PNG o WebP de hasta 5 MB.
2. Una persona administradora revisa la evidencia desde el panel **Revisión de entregas**.
3. La administradora confirma la evidencia. Después puede marcar la entrega como completada. Las entregas completadas suman al progreso de fidelidad.

Las imágenes se guardan de forma privada en `uploads/evidence/`; no se sirven como archivos públicos ni se deben incluir en copias del repositorio.

### Habilitar una cuenta administradora

No se crea automáticamente ninguna cuenta administradora. Primero registra una cuenta de confianza en la página y luego cambia su rol desde PostgreSQL:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'correo-de-la-persona-administradora@example.com';
```

Después, cierra sesión e inicia sesión nuevamente para que el token de acceso recoja el nuevo rol. Limita el rol administrador a personas autorizadas.

### Migración de base de datos

Antes de desplegar esta versión en otra base de datos, ejecuta `database/migrations/001_add_evidence_filename.sql` conectado a esa base. La migración es segura de ejecutar más de una vez.
