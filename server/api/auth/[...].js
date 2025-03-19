import { NuxtAuthHandler } from '#auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoClient, ServerApiVersion } from "mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

const {
  nextAuthSecret,
  mongodbUri,
  marangaduUser,
  marangaduPassword,
  marangaduHost,
  marangaduPort,
  marangaduFrom,
} = useRuntimeConfig();

const options = {
  tls: true,
  maxPoolSize: 5,
  // serverSelectionTimeoutMS: 5000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let clientPromise;

console.log('NODE_ENV', process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(mongodbUri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(mongodbUri, options);
  clientPromise = client.connect();
}

console.log('clientPromise', clientPromise);

export default NuxtAuthHandler({
  debug: true,
  secret: nextAuthSecret,
  pages: {
    signIn: `/auth/login`,
    verifyRequest: `/auth/verify`,
  },
  providers: [
    EmailProvider.default({
      id: 'magic-link',
      name: 'send magic link by email',
      type: 'email',
      server: {
        host: marangaduHost,
        port: marangaduPort,
        auth: {
          user: marangaduUser,
          pass: marangaduPassword,
        },
      },
      from: marangaduFrom,
      maxAge: 60 * 60,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise)
});
