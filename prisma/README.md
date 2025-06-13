# prisma

## **Using the Prisma repository in a microservice**

### **Steps to follow for each microservice:**

1. **Clone the Prisma repository into the microservice folder**:
```bash
git clone https://github.com/locaccm/prisma.git prisma
```

> The `prisma` folder must be at the root of the microservice.

2. **Install the Prisma dependencies (if not already installed)**:
```bash
npm install @prisma/client
```

> No need to install `prisma`, just `@prisma/client` on the microservice side.

3. **Generate the Prisma client from the cloned schema**:
```bash
npx prisma generate --schema=./prisma/schema.prisma
```

> This command will automatically create the Prisma client in `node_modules/@prisma/client`.

4. **Use Prisma in the microservice code**:
Example `lib/prisma.ts` file:
```ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

And in the routes:
```ts
import { prisma } from './lib/prisma';

const users = await prisma.user.findMany();
```

---

### **Regenerate if the database changes**

If a new migration is pushed to the Prisma repo (or if you do a `git pull`), **rerun**:
```bash
npx prisma generate --schema=./prisma/schema.prisma
```
