const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt')

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.serializeUser(function (user, done) {
  // console.log("Сериализация");
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  // console.log("Десериализация");
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  const userDes = user.id === id ? user : false;
  done(null, userDes);
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return done(null, false, { message: "Не найден" });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (isValid) {
      console.log("Успешно!");
      return done(null, user, { message: "welcome!" });
    } else {
      return done(null, false, { message: "Неправильный логин или пароль" });
    }
  })
);
