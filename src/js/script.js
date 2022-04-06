'use strict';

Vue.component('task-stepper', {
    name: 'TaskStepper',
    template: `
        <div
            class="task-stepper"
            :class="{
                'task-stepper--second': step === 2
            }"
        >
            <h2 class="task-stepper__title">{{ info.buttonTitle }}</h2>

            <div
                v-if="step === 1"
                class="task-stepper__preview"
                v-html="info.preview"
            ></div>

            <template v-if="step === 1 && info.text">
                <button
                    class="button task-stepper__start-button"
                    type="button"
                    @click="changeStep"
                >
                    Начать
                </button>
            </template>

            <template
                v-else-if="step === 2"
            >
                <div
                    v-if="info.text"
                    class="task-stepper__text"
                    v-html="info.text"
                ></div>
                <div class="task-stepper__content" v-html="info.content"></div>
                <form
                    class="task-stepper__form"
                    method="POST"
                    action="/"
                    @submit.prevent="submitAnswer(info)"
                    autocomplete="off"
                >
                    <input
                        v-model="info.answer"
                        class="input task-stepper__input"
                        :class="{
                            'task-stepper__input--error': info.error,
                        }"
                        type="text"
                        placeholder="Ввод кода*"
                        :disabled="info.success"
                        name="answer"
                        required
                        @input="info.error = false"
                    />
                    <button
                        class="button task-stepper__submit"
                        type="submit"
                        :disabled="info.success && info.answer.length === 0"
                    >
                        Отправить
                    </button>
                </form>
            </template>

            <p class="task-stepper__text" v-else>
                Что-то пошло не так
            </p>
        </div>
    `,
    props: {
        info: {
            type: Object,
            required: true
        },
        answers: {
            type: Map,
            required: true
        }
    },
    data() {
        return {
            step: 1
        }
    },
    methods: {
        checkAnswer(task) {
            if (task) {
                const formattedAnswer = task.answer.trim().toLowerCase();
                const correct = this.answers.get(task.id).toLowerCase();

                if (formattedAnswer !== correct) {
                    task.error = true;

                    return false;
                }

                return true;
            }
        },
        submitAnswer(task) {
            if (!task.success && this.checkAnswer(task)) {
                task.success = true;

                this.$emit('success', { id: task.id, points: task.points });
            }
        },
        changeStep() {
            this.step = 2;
            this.$emit('change-step', 2);
        },
        reset() {
            this.step = 1;
        }
    }
});

// Компонент попапа
Vue.component('popup', {
    template: `
        <transition name="fade">
            <section
                class="popup"
                v-show="showPopup"
            >
                <div class="popup__overlay" @click="close"></div>

                <div class="popup__content">
                    <button class="popup__close" @click="close">
                        <span class="visually-hidden">Закрыть</span>
                    </button>
                    <slot />
                </div>
            </section>
        </transition>
    `,
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        showPopup: {
            set (value) {
                this.$emit('update:show', value);
            },
            get () {
                return this.show;
            }
        }
    },
    methods: {
        close() {
            this.showPopup = false;

            this.$emit('update-info');
        }
    }
});

// Компонент с заданиями
Vue.component('task', {
    template: `
        <div
            class="task"
        >
            <button
                class="task__activator"
                :class="{
                    'task__activator--success': info.success
                }"
                @click="showPopup = true"
                type="button"
                :disabled="disabled"
            >
                <img v-if="!disabled" :src="info.success ? info.imageSuccess : info.image" alt="" />
            </button>
            <section
                v-if="info.points && info.time"
                class="tip task__tip"
            >
                <p class="tip__title">{{ info.buttonTitle }}</p>
                <ul class="tip__list">
                    <li class="tip__item tip__item--level">
                        {{ levelString }}
                    </li>
                    <li class="tip__item tip__item--points">
                        {{ pointsString }}
                    </li>
                    <li class="tip__item tip__item--time">
                        {{ timeString }}
                    </li>
                </ul>
            </section>
            <template v-if="!disabled">
                <popup
                    class="popup-task"
                    :class="{
                        'popup-task--last-step': isLastStep
                    }"
                    :show.sync="showPopup"
                    @update-info="onUpdateInfo"
                >
                    <div class="container popup__container" v-scroll-lock="showPopup">
                        <task-stepper
                            ref="stepper"
                            :info="info"
                            :answers="answers"
                            @success="onSuccess($event)"
                            @change-step="onChangeStep($event)"
                        ></task-stepper>
                    </div>
                </popup>
            </template>
        </div>
    `,
    props: {
        info: {
            type: Object,
            required: true
        },
        answers: {
            type: Map,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showPopup: false,
            isLastStep: false
        };
    },
    computed: {
        levelString() {
            if (this.info.points >= 10) {
                return 'Сложная';
            } else if (this.info.points >= 6) {
                return 'Средняя';
            }

            return 'Легкая';
        },
        pointsString() {
            const pointsCheck = this.info.points % 10;

            if (pointsCheck === 1) {
                return `${this.info.points} балл`;
            } else if (
                pointsCheck === 0
                || pointsCheck >= 5
                || this.info.points >= 11
                && this.info.points <= 14
            ) {
                return `${this.info.points} баллов`;
            }

            return `${this.info.points} балла`;
        },
        timeString() {
            const timeCheck = this.info.time % 10;

            if (timeCheck === 1) {
                return `${this.info.time} минута`;
            } else if (
                timeCheck === 0
                || timeCheck >= 5
                || this.info.time >= 11
                && this.info.time <= 14
            ) {
                return `${this.info.time} минут`;
            }

            return `${this.info.time} минуты`;
        }
    },
    methods: {
        onSuccess(taskInfo) {
            this.showPopup = false;
            this.$emit('success', taskInfo);
        },
        onChangeStep(step) {
            if (step === 2) {
                this.isLastStep = true;
            }
        },
        onUpdateInfo() {
            setTimeout(() => {
                this.$refs.stepper.reset();
                this.isLastStep = false;
            }, 600);
            this.$emit('update-info');
        }
    }
});

// Компонент регистрации
Vue.component('registration', {
   template: `
        <div class="registration">
            <p class="text w-45">Пожалуйста, зарегистрируйте вашу команду. Запомните или запишите логин и пароль!</p>
            <p class="text w-45">Если у вас возникнут технические вопросы — обращайтесь к модераторам в чате команды в Telegram.</p>
            <p class="text w-45">Удачи!</p>
            <form
                class="form registration__form"
                @submit.prevent="teamRegistration(name, password, clonePassword)"
                autocomplete="off"
            >
                <p class="form__error">
                    {{ errorMessage }}
                </p>
                <p class="form__group">
                    <input
                        type="text"
                        class="input"
                        placeholder="Название команды* (до 20 символов)"
                        v-model="name"
                        @input="clearError"
                        required>
                </p>
                <p class="form__group">
                    <input
                        type="password"
                        class="input"
                        placeholder="Пароль* (не менее 6 символов)"
                        v-model="password"
                        @input="clearError"
                        required>
                </p>
                <p class="form__group">
                    <input
                        type="password"
                        class="input"
                        placeholder="Повторите пароль*"
                        v-model="clonePassword"
                        @input="clearError"
                        required>
                </p>
                <button
                    class="button"
                    type="submit"
                    :disabled="isLoading"
                >
                    Создать
                </button>
                <a
                    class="button button--transparent"
                    href="#auth"
                    @click.prevent="goToAuth"
                >
                    Авторизация
                </a>
            </form>
        </div>
   `,
    props: {
        teamInfo: {
            type: Object,
            required: true
        },
        transliteration: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            errorMessage: '',
            name: '',
            password: '',
            clonePassword: '',
            isLoading: false
        };
    },
    methods: {
        goToAuth() {
            this.$emit('change-auth');
        },
        clearError() {
            this.errorMessage = '';
        },
        async teamRegistration (name, password, clonePassword) {
            const nameRegExp = /^[a-zA-Zа-яА-Я0-9\_\-\. ]{3,20}$/;
            name = name.trim();

            if (nameRegExp.test(name)) {
                if (password !== '' && clonePassword !== '') {
                    if (password.length >= 6 && clonePassword.length >= 6) {
                        if (password === clonePassword) {
                            try {
                                this.isLoading = true;
                                const originalName = name;
                                name = this.transliteration(name.replace(' ', '_')) + '@mail.ru';

                                const user = await firebase.auth().createUserWithEmailAndPassword(name, password);

                                this.teamInfo.userId = user.user.uid;

                                if (user) {
                                    const teamObject = {
                                        teamId: user.user.uid,
                                        teamName: originalName
                                    };

                                    const team = await firebase.database().ref('commands').push(teamObject);
                                    this.$set(this.teamInfo, 'teamId', team.key);
                                    this.$set(this.teamInfo, 'teamName', originalName);
                                }

                                localStorage.setItem('teamInfo', JSON.stringify(this.teamInfo));
                                this.isLoading = false;
                            } catch (e) {
                                this.isLoading = false;
                                switch (e.code) {
                                    case 'auth/email-already-in-use':
                                        this.errorMessage = 'Такая команда уже зарегистрирована';
                                        break;
                                    default:
                                        this.errorMessage = 'Произошла непредвиденная ошибка';
                                }
                            }

                        } else {
                            this.isLoading = false;
                            this.errorMessage = 'Введеные пароли не совпадают';
                        }
                    } else {
                        this.isLoading = false;
                        this.errorMessage = 'Пароль должен содержать не менее 6-ти символов';
                    }
                } else {
                    this.isLoading = false;
                    this.errorMessage = 'Пароль не должен быть пустым';
                }
            } else {
                this.isLoading = false;
                this.errorMessage = 'Название команды заполнено некорректно';
            }
        }
    }
});

// Компонент авторизации
Vue.component('sign-in', {
    template: `
        <div class="sign-in">
            <form
                class="form sign-in__form"
                autocomplete="off"
            >
                <p class="form__error">{{ errorMessage }}</p>
                <p class="form__group">
                    <input
                        type="text"
                        class="input"
                        placeholder="Название команды*"
                        v-model="name"
                        @input="clearError"
                        required>
                </p>
                <p class="form__group">
                    <input
                        type="password"
                        class="input"
                        placeholder="Пароль*"
                        v-model="password"
                        @input="clearError"
                        required>
                </p>
                <button
                    class="button"
                    :disabled="isLoading"
                    @click.prevent="teamAuth(name, password)"
                >
                    Начать
                </button>
                <a
                    class="button button--transparent"
                    href="#reg"
                    @click.prevent="goToRegistration"
                >
                    Регистрация
                </a>
            </form>
        </div>
    `,
    props: {
      teamInfo: {
          type: Object,
          required: true
      },
      transliteration: {
          type: Function,
          required: true
      }
    },
    data() {
        return {
            errorMessage: '',
            name: '',
            password: '',
            isLoading: false
        };
    },
    methods: {
        goToRegistration() {
            this.$emit('change-reg');
        },
        clearError() {
            this.errorMessage = '';
        },
        async teamAuth (name, password) {
            try {
                this.isLoading = true;
                name = this.transliteration(name.replace(' ', '_')) + '@mail.ru';
                const user = await firebase.auth().signInWithEmailAndPassword(name, password);

                this.$set(this.teamInfo, 'userId', user.user.uid);

                const team = await firebase.database().ref('commands').once('value');
                const teams = team.val();

                for (const key in teams) {
                    if (teams[key].teamId === this.teamInfo.userId) {
                        this.$set(this.teamInfo, 'teamId', key);
                        this.$set(this.teamInfo, 'teamName', teams[key].teamName ?? '');
                    }
                }

                localStorage.setItem('teamInfo', JSON.stringify(this.teamInfo));
                this.$emit('success');
                this.isLoading = false;
            } catch (e) {
                console.log(e);
                this.isLoading = false;
                switch (e.code) {
                    case 'auth/user-not-found':
                        this.errorMessage = 'Такой команды не существует';
                        break;
                    default:
                        this.errorMessage = 'Произошла непредвиденная ошибка';
                }
            }

        }
    }
});

// Компонент подсчета результатов
Vue.component('result-game', {
    template: `
        <div class="result-game">
            {{ teamInfo.teamName }}
            <span class="result-game__points">
                {{ teamInfo.sumPoint }}
            </span>
            <button class="btn-exit result-game__exit" @click="logout"></button>
        </div>
    `,
    props: {
        teamInfo: {
            type: Object,
            required: true
        }
    },
    methods: {
        // При инициализации компонента сделать запрос в базу и получить количество итоговых очков
        async getTeamResults () {

            const results = await firebase.database().ref('commands').once('value');
            const result = results.val();

            for (const key in result) {
                if (key === this.teamInfo.teamId) {
                    let sumPoints = 0;
                    for (const k in result[key]) {
                        if (k.indexOf('answer') !== -1) {
                            this.$set(this.teamInfo, 'sumPoint', sumPoints += result[key][k]);
                        }

                    }

                }
            }
            localStorage.setItem('teamInfo', JSON.stringify(this.teamInfo));
            await firebase.database().ref('commands').child(this.teamInfo.teamId).update({sumPoint: this.teamInfo.sumPoint}); //Перенести этот функционал в компонент с тасками и делать update только после окончания времени или прохождения всех локаций
        },
        logout() {
            localStorage.removeItem('teamInfo');
            window.location.reload();
        }
    },
    created () {
        this.getTeamResults();
    },
    watch: {
        teamInfo: {
            handler () {
                this.computedText;
            },
            deep: true
        }
    }
});

// Компонент распределения очков
Vue.component('avatar-create', {
    template: `
        <div class="avatar">
            <div class="avatar__popup" v-if="showPopup">
                <p>Результаты можно отправить лишь один раз, Вы точно распределили все корректно?</p>
                <div class="avatar__popup-group">
                    <button class="avatar__btn avatar__btn--success" @click="successUserAvatar">Отправить</button>
                    <button class="avatar__btn avatar__btn--error" @click="showPopup = false">Отменить</button>
                </div>
            </div>
            <div class="avatar__image">
                <img src="image/avatar.png" alt="">
                <div class="avatar__skins">
                    <img class="avatar__skin avatar__skin--frame-1" src="image/frame_1.svg" alt="" v-show="specifications[0].total <= 2 && specifications[0].total > 0">
                    <img class="avatar__skin avatar__skin--frame-2" src="image/frame_2.svg" alt="" v-show="specifications[0].total <= 4 && specifications[0].total > 2">
                    <img class="avatar__skin avatar__skin--frame-3" src="image/frame_3.svg" alt="" v-show="specifications[0].total <= 6 && specifications[0].total > 4">
                    <img class="avatar__skin avatar__skin--mult-1" src="image/mult_1.svg" alt="" v-show="specifications[3].total <= 2 && specifications[3].total > 0">
                    <img class="avatar__skin avatar__skin--mult-2" src="image/mult_2.svg" alt="" v-show="specifications[3].total <= 4 && specifications[3].total > 2">
                    <img class="avatar__skin avatar__skin--mult-3" src="image/mult_3.png" alt="" v-show="specifications[3].total <= 6 && specifications[3].total > 4">
                    <img class="avatar__skin avatar__skin--sec-1" src="image/sec_1.svg" alt="" v-show="specifications[1].total > 1">
                    <img class="avatar__skin avatar__skin--sec-2" src="image/sec_2.svg" alt="" v-show="specifications[1].total > 3">
                    <img class="avatar__skin avatar__skin--sec-3" src="image/sec_3.svg" alt="" v-show="specifications[1].total > 5">
                    <img class="avatar__skin avatar__skin--micr-1" src="image/micr_1.svg" alt="" v-show="specifications[2].total > 1">
                    <img class="avatar__skin avatar__skin--micr-2" src="image/micr_2.svg" alt="" v-show="specifications[2].total > 3">
                    <img class="avatar__skin avatar__skin--micr-3" src="image/micr_3.svg" alt="" v-show="specifications[2].total > 4">
                    <img class="avatar__skin avatar__skin--ch-1" src="image/ch_1.svg" alt="" v-show="specifications[4].total > 1">
                    <img class="avatar__skin avatar__skin--ch-2" src="image/ch_2.svg" alt="" v-show="specifications[4].total > 3">
                    <img class="avatar__skin avatar__skin--ch-3" src="image/ch_3.svg" alt="" v-show="specifications[4].total > 5">
                    <img class="avatar__skin avatar__skin--dev-1" src="image/dev_1.svg" alt="" v-show="specifications[5].total > 0">
                    <img class="avatar__skin avatar__skin--dev-2" src="image/dev_2.svg" alt="" v-show="specifications[5].total > 1">
                    <img class="avatar__skin avatar__skin--dev-3" src="image/dev_3.svg" alt="" v-show="specifications[5].total > 2">
                    <img class="avatar__skin avatar__skin--dev-4" src="image/dev_4.svg" alt="" v-show="specifications[5].total > 3">
                    <img class="avatar__skin avatar__skin--dev-5" src="image/dev_5.svg" alt="" v-show="specifications[5].total > 4">
                </div>
            </div>
            <h2 class="title">Правила сборки виртуального ассистента</h2>
            <div class="text-group text-group--avatar">
                <p class="text w-100">Вы посетили множество локаций и изучили, как разрабатывается виртуальный ассистент, какие модули можно внедрить и какой функционал важен для пользователей. Теперь вам нужно принять финальное решение: каким станет виртуальный ассистент Райффайзенбанка?</p>
                <p class="text w-100">Баллы, набранные вами в ходе квеста — это ресурсы команды разработки. Используйте их, чтобы собрать самого технологичного и клиентоориентированного ассистента. Вместе с командой выберите, какие функциональные модули вы хотите внедрить в первую очередь, и создайте лучшего ассистента для клиентов банка! Подходите к выбору тщательно: ресурсы команды ограничены, и вы не сможете внедрить все модули.</p>
                <p class="text w-100">Отправить командное решение можно только один раз. Поэтому внимательно проверьте его, прежде чем нажать кнопку «Отправить». При проверке учитываются баллы, распределенные между модулями ассистента.</p>
            </div>
            <div class="avatar__list">
                <div
                    class="avatar__group"
                    v-for="(specification, i) in specifications">
                    <button class="avatar__toggle sub-title" @click="openSpecifications"> {{ specification.name }} </button>
                    <div class="avatar__specifications">
                        <button
                            class="avatar__specification"
                            v-for="(option, j) in specification.options"
                            @click="addPoint(i, j, $event)"
                            :disabled="teamInfo.sumPoint < option.price && !option.bought"
                            >{{ option.name }} <span class="price">{{ option.price }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="avatar__final">
                <button
                    class="avatar__save"
                    :disabled="isLoading"
                    @click="checkAvatarPoints"
                >Отправить ассистента на оценку</button>
            </div>
        </div>
    `,
    props: {
        teamInfo: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            specifications: [
                {
                    name: 'Фреймворки Виртуального ассистента',
                    total: 0,
                    options: [
                        {
                            name: 'Система логирования',
                            price: 6,
                            bought: false
                        },
                        {
                            name: 'Модуль обработки естественного языка (Natural Language Processing, NLP)',
                            price: 6,
                            bought: false
                        },
                        {
                            name: 'Модуль понимания естественного языка (Natural-language understanding, NLU)',
                            price: 6,
                            bought: false
                        },
                        {
                            name: 'Модуль генерации естественного языка (Natural Language Generation, NLG)',
                            price: 6,
                            bought: false
                        },
                        {
                            name: 'Система интеграции баз данных и источников информации',
                            price: 6,
                            bought: false
                        }
                    ]
                },
                {
                    name: 'Безопасность',
                    total: 0,
                    options: [
                        {
                            name: 'Аутентификация по паролю',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Аутентификация по отпечатку',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Аутентификация по голосу',
                            price: 5,
                            bought: false
                        },
                        {
                            name: 'Аутентификация по лицу',
                            price: 5,
                            bought: false
                        },
                        {
                            name: 'Аутентификация по SMS',
                            price: 2,
                            bought: false
                        },
                        {
                            name: 'Сквозное шифрование',
                            price: 6,
                            bought: false
                        }
                    ]
                },
                {
                    name: 'Микросервисы',
                    total: 0,
                    options: [
                        {
                            name: 'Приложения для здоровья',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Развлекательные приложения (музыка, кино и т.д.)',
                            price: 5,
                            bought: false
                        },
                        {
                            name: 'Финансовые приложения',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Офисные приложения',
                            price: 2,
                            bought: false
                        },
                        {
                            name: 'Гостеприимство и бронирование ресторанов',
                            price: 3,
                            bought: false
                        }
                    ]
                },
                {
                    name: 'Мультимодальность',
                    total: 0,
                    options: [
                        {
                            name: 'Графический интерфейс пользователя (GUI)',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Модуль распознавания и генерации текста',
                            price: 5,
                            bought: false
                        },
                        {
                            name: 'Модуль распознавания и генерации аудио сигнала',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Модуль распознавания и генерации изображений ',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Модуль распознавания видео и генерации анимации ',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Модуль перевода',
                            price: 2,
                            bought: false
                        }
                    ]
                },
                {
                    name: 'Поддерживаемые каналы',
                    total: 0,
                    options: [
                        {
                            name: 'Горячая линия банка',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Веб-сайт банка',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Приложение банка',
                            price: 3,
                            bought: false
                        },
                        {
                            name: 'Мессенджеры',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Социальные сети',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Веб-сайты партнеров',
                            price: 3,
                            bought: false
                        }
                    ]
                },
                {
                    name: 'Поддерживаемые устройства',
                    total: 0,
                    options: [
                        {
                            name: 'ПК',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Смартфон и планшет',
                            price: 4,
                            bought: false
                        },
                        {
                            name: 'Умные часы',
                            price: 2,
                            bought: false
                        },
                        {
                            name: 'Автомобиль',
                            price: 2,
                            bought: false
                        },
                        {
                            name: 'Умный дом',
                            price: 4,
                            bought: false
                        }
                    ]
                },
            ],
            isLoading: false,
            isConfirm: false,
            showPopup: false
        };
    },
    created () {
        if (localStorage.getItem('specifications')) {
            try {
                this.specifications = JSON.parse(localStorage.getItem('specifications'));
            } catch (e) {
                localStorage.removeItem('specifications');
            }
        }
    },
    methods: {
        addPoint (i, j, event) {

            if (event.target.classList.contains('active')) {
                this.teamInfo.sumPoint += this.specifications[i].options[j].price;
                this.specifications[i].options[j].bought = false;
                event.target.classList.remove('active');
                this.specifications[i].total--;
            } else {
                if (this.teamInfo.sumPoint < this.specifications[i].options[j].price) {
                    alert('Недостаточно очков для прокачки');
                } else {
                    this.teamInfo.sumPoint -= this.specifications[i].options[j].price;
                    this.specifications[i].options[j].bought = true;
                    event.target.classList.toggle('active');

                    this.specifications[i].total++;
                }
            }
        },
        openSpecifications (event) {
            const currentEl = event.target;

            document.querySelectorAll('.avatar__toggle').forEach(el => {
               el.classList.remove('open');
            });

            document.querySelectorAll('.avatar__specifications').forEach(el => {
               el.classList.remove('show');
            });

            currentEl.classList.toggle('open');

            currentEl.nextElementSibling.classList.toggle('show');
        },
        successUserAvatar () {
            this.isConfirm = true;
            this.checkAvatarPoints();
        },
        async checkAvatarPoints () {
            if (this.isConfirm) {
                try {
                    this.isLoading = true;
                    const team = await firebase.database().ref('commands').once('value');
                    const teams = team.val();

                    for (const key in teams) {
                        if (teams[key].teamId === this.teamInfo.userId) {
                            if (!teams[key].specifications) {
                                this.savePoints();
                            } else {
                                alert('Кто-то из Вашей команды уже отправил консультанта на проверку');
                                this.$emit('save-points');
                            }
                        }
                    }
                    this.isLoading = false;
                } catch (e) {
                    console.log(e);
                }
            } else {
                this.showPopup = true;
            }
        },
        async savePoints () {
            this.specifications.forEach(specification => {
                let total = 0;
                specification.options.forEach(option => {
                    option.bought ? total++ : '';
                });
                specification.total = total;
            });

            // Перед сохранением всех очков нужно вывести сообщение о том, что потом перераспределить очки больше нельзя
            this.$set(this.teamInfo, 'specifications', this.specifications);

            localStorage.setItem('specifications', JSON.stringify(this.specifications));
            localStorage.setItem('teamInfo', JSON.stringify(this.teamInfo));

            this.$emit('save-points');

            try {
                this.isLoading = true;
                await firebase.database().ref('commands').child(this.teamInfo.teamId).update({specifications: this.teamInfo.specifications});
                this.isLoading = false;
            } catch (e) {
                console.log(e);
            }
        }
    }
});

Vue.component('results', {
    template: `
        <div class="results">
            <h1 class="title">Рейтинг</h1>
            <form
                class="search-form results__form"
                method="GET"
                action="/"
                @submit.prevent="search"
            >
                <input
                    v-model="searchString"
                    class="input search-form__input"
                    type="text"
                    placeholder="Поиск по командам*"
                    name="search"
                />
                <button
                    class="button"
                    type="submit"
                >
                    Поиск
                </button>
            </form>
            <table v-if="visibleResults.length">
                <thead>
                    <th style="min-width: 54px; max-width: 54px;">Номер команды</th>
                    <th style="min-width: 196px; max-width: 196px;">Название команды</th>
                    <th>Фреймворки</th>
                    <th>Безопасность</th>
                    <th>Микросервисы</th>
                    <th>Мультимодальность</th>
                    <th>Поддерживаемые каналы</th>
                    <th>Поддерживаемые устройства</th>
                    <th>Сумма баллов (распределенных)</th>
                </thead>
                <tbody>
                    <tr v-for="(result, idx) in visibleResults" :class="{'win': result.win}" v-if="result.teamName" :key="idx">
                        <td>{{ ++idx }}</td>
                        <td>{{ result.teamName }}</td>
                        <template v-if="result.specifications">
                            <td>{{ result.specifications[0]?.options?.sum }}</td>
                            <td>{{ result.specifications[1]?.options?.sum }}</td>
                            <td>{{ result.specifications[2]?.options?.sum }}</td>
                            <td>{{ result.specifications[3]?.options?.sum }}</td>
                            <td>{{ result.specifications[4]?.options?.sum }}</td>
                            <td>{{ result.specifications[5]?.options?.sum }}</td>
                            <td>{{ result.activeSum }}</td>
                        </template>
                        <template v-else>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    data() {
        return {
            searchString: '',
            results: [],
            visibleResults: []
        }
    },
    props: {
      teamInfo: {
          type: Object,
          required: true
      }
    },
    created () {
        this.getResults();
    },
    methods: {
        async getResults () {
            const result = await firebase.database().ref('commands').once('value');
            const results = result.val();
            const resultsArray = [];
            Object.keys(results).forEach(key => {
                const r = results[key];
                resultsArray.push({
                    teamName: r.teamName,
                    specifications: r.specifications,
                    win: r.win
                })
            });

            resultsArray.forEach(result => {
               result.specifications?.forEach(specification => {
                   let sum = 0;
                  specification.options?.forEach(option => {
                     option.bought ? sum += option.price : sum += 0;
                  });
                   specification.options ? specification.options.sum = sum : '';
                   result.sumPoint = this.teamInfo.sumPoint;
               });
            });

            resultsArray.forEach(result => {
                let activeSum = 0;
               result.specifications?.forEach(specification => {
                  activeSum += specification.options?.sum;
               });
               result.activeSum = activeSum;
            });

            this.results = resultsArray.filter(item => item.teamName);
            this.results.sort( (a, b) => b.activeSum - a.activeSum);

            this.visibleResults = this.results;
        },
        search() {
            this.visibleResults = this.searchString.length ? this.results.filter(item => {
                return item.teamName.includes(this.searchString);
            }) : this.results;
        }
    }
});

// Глобальный Vue объект
new Vue({
    el: '#app',
    data: {
        storyStep: 1,
        showRegistration: true,
        assistantConfirmPopupShow: false,
        groups: [{
            id: 1,
            access: true,
            tasks: [{
                id: 1,
                buttonTitle: 'План разработки ассистента',
                content: '<iframe src="https://learningapps.org/watch?v=pswxhx2gc21" frameborder="0"></iframe>',
                preview: '<p class="text">Перед разработкой виртуального ассистента важно обозначить основные этапы проекта. Технологический прогресс не стоит на месте, поэтому помимо гибких методологий, лежащих в основе работы команд Райффайзенбанка, гибким должен быть и сам продукт. Проектный план должен предполагать, что после запуска виртуального ассистента его ждет развитие: с каждым новым обновлением он будет становиться совершеннее и лучше удовлетворять потребности пользователей.</p>',
                text: '<p class="text">Вы собрались с командой и представителями каждого задействованного департамента, чтобы вместе составить план. Заполните таблицу, расставив этапы и стадии создания виртуального ассистента в правильном порядке.</p>',
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 21,
                image: '../image/task_21.svg',
                imageSuccess: '../image/task_21_success.svg',
            }, {
                id: 2,
                buttonTitle: 'Архитектура коммуникаций и NLP-модель',
                content: '<iframe src="https://learningapps.org/watch?v=pf79c9y1a21" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Чтобы виртуальный ассистент обрабатывал речь, в нем должна быть технология Natural Language Processing, или модуль обработки естественного языка. С помощью NLP он сможет воспринимать язык, на котором говорит или пишет пользователь, — интерпретировать и даже использовать его для ответа.</p>
                    <p class="text">NLP подразумевает два основных направления работы: понимание естественного языка (NLU) и создание естественного языка (NLG). NLU — это часть обработки естественного языка, которая использует синтаксический и семантический анализ текста и речи для определения значения предложения. Синтаксис относится к грамматической структуре предложения, а семантика указывает на его предполагаемое значение. NLG позволяет компьютерам писать осмысленные предложения и вести диалоги. NLG — это создание текстового ответа на человеческом языке на основе введенных данных. Потом этот текст можно преобразовать в речь для голосового ответа ассистента. Говоря простым языком, NLU «читает», а NLG «пишет».</p>
                `,
                text: `
                    <p class="text">Вы собрались с командой и представителями каждого задействованного департамента, чтобы вместе составить план. Заполните таблицу, расставив этапы и стадии создания виртуального ассистента в правильном порядке.</p>
                    <p class="text">Вы можете нажимать на элементы, чтобы приближать их, и передвигать, зажав кнопкой мыши. В правом верхнем углу расположена кнопка полноэкранного режима — нажмите ее сразу, чтобы удобнее проходить задание, после нажатия ваше решение может сброситься. В правом нижнем углу — кнопка для подтверждения ответа. Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 20,
                image: '../image/task_20.svg',
                imageSuccess: '../image/task_20_success.svg',
            }, {
                id: 3,
                buttonTitle: 'Вычислительные мощности',
                content: '<iframe src="https://learningapps.org/watch?v=p7ckikj4k21" frameborder="0"></iframe>',
                preview: '<p class="text">Вы испытываете виртуального ассистента в экстремальных условиях, когда количество запросов от пользователей возрастает. Например, если семья собирается в поездку и торопится, помощник должен обрабатывать сразу несколько запросов из разных каналов и от разных людей. Способность эффективно отвечать даже в такой ситуации стала бы настоящим конкурентным преимуществом для виртуального ассистента.</p>',
                text: '<p class="text">Помогите команде разработчиков рассчитать скорость обработки запросов.</p><p class="text">Введите полученный в награду код в поле ответа под заданием.</p>',
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 19,
                image: '../image/task_19.svg',
                imageSuccess: '../image/task_19_success.svg',
            }],
        },
        {
            id: 2,
            access: false,
            tasks: [{
                id: 4,
                buttonTitle: 'CustDev-интервью',
                content: '<iframe src="https://www.videoask.com/fct6rbx73" allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *;" width="100%" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Чтобы создать качественный продукт для пользователя, команда виртуального ассистента использует Customer Development — тестирование идеи или прототипа на целевой аудитории. Метод позволяет избежать «туннельного зрения», то есть ситуации, когда команда настолько сосредоточена на собственном видении, что перестает прислушиваться к мнению потребителя. Без CustDev невозможно создать лучшего виртуального ассистента: в помощнике должен быть соблюден баланс человечности и технологий, и только пользователи знают, где именно находится этот баланс.</p>
                    <p class="text">Один из элементов CustDev — глубинное интервью. Открытый диалог с представителем ЦА помогает получить как можно больше информации об опыте использования продукта или услуги. Команда решила провести интервью с пользователем мобильного приложения Райффайзенбанка, в котором есть ранняя версия виртуального ассистента.</p>
                `,
                text: `
                    <p class="text">Проведите интервью с пользователем, чтобы выяснить, как именно он использует ВА и какие сложности у него возникают. Важно правильно вести диалог, задавать вопросы, которые позволят получить нужную информацию и не заведут беседу в тупик, иначе придется начать общение с начала.</p>
                    <p class="text">Если все сделано верно, пользователь назовет вам кодовое слово перед тем, как попрощаться. Введите полученное в награду слово в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 18,
                image: '../image/task_18.svg',
                imageSuccess: '../image/task_18_success.svg',
            },
            {
                id: 5,
                buttonTitle: 'Типы данных',
                content: '<iframe src="https://learningapps.org/watch?v=puqt2cjot21" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Все данные, к которым обращается виртуальный ассистент, разделены на типы для более удобного хранения, обработки и анализа. Чтобы виртуальный ассистент мог дать полезный ответ на запрос пользователя или выполнить задачу, ему надо знать, к данным какого типа обращаться.</p>
                    <p class="text">В логике виртуального ассистента есть следующие типы данных:</p>
                    <ul class="list">
                        <li class="list__item">числовые данные — любые данные, которые хранятся в виде чисел;</li>
                        <li class="list__item">текстовые данные — любые данные, которые хранятся в виде текста;</li>
                        <li class="list__item">даты — любые данные, которые хранятся в виде дат: в формате DD.MM.YYYY и похожих;</li>
                        <li class="list__item">геопозиция — любые данные, которые хранятся в виде текста для обозначения адресов и имеют привязку к карте;</li>
                        <li class="list__item">мультиселект — любые данные, которые могут храниться единым списком для отдельного пользователя, категории и др.</li>
                    </ul>
                `,
                text: `
                    <p class="text">Помогите виртуальному ассистенту соотнести запросы пользователя с теми типами данных, к которым ему надо обратиться. Каждому типу соответствует три запроса, в столбцах соответствующие запросы можно размещать в любом порядке.</p>
                    <p class="text">Вы можете нажимать на элементы, чтобы приближать их, и передвигать, зажав кнопкой мыши. В правом верхнем углу расположена кнопка полноэкранного режима — нажмите ее сразу, чтобы удобнее проходить задание, после нажатия ваше решение может сброситься. В правом нижнем углу — кнопка для подтверждения ответа. Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 17,
                image: '../image/task_17.svg',
                imageSuccess: '../image/task_17_success.svg',
            }, {
                id: 6,
                buttonTitle: 'Испытание на прочность',
                content: '<iframe src="https://learningapps.org/watch?v=pco904ht321" frameborder="0"></iframe>',
                preview: '<p class="text">Сегодня репутация IT-продукта зависит не только от того, как его воспримут рядовые пользователи. Каждый новый релиз сопровождается пристальным вниманием инфлюенсеров. Это коснется и запуска виртуального ассистента. В своих блогах, на каналах и в прямых эфирах блогеры испытают нового помощника Райффайзенбанка на прочность и постараются подловить его на замысловатых и каверзных вопросах.</p>',
                text: '<p class="text">Чтобы стойко выдержать эти испытания, вы решили подготовить и обучить виртуального ассистента дополнительно. Помогите ему отгадать загадки.</p><p class="text">Ответ может быть одним словом или словосочетанием, все буквы русские, можно использовать дефис и любой размер букв. Введите полученный в награду код в поле ответа под заданием.</p>',
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 16,
                image: '../image/task_16.svg',
                imageSuccess: '../image/task_16_success.svg',
            }, {
                id: 7,
                buttonTitle: 'Думай как Эйнштейн',
                content: null,
                preview: '<p class="text">Искусственный интеллект становится более совершенным, и теперь пользователи ждут от него практически человеческого мышления: он должен легко находить логические взаимосвязи и уметь быстро их анализировать.</p>',
                text: `
                    <p class="text">Помогите виртуальному ассистенту определить, кто в команде работает по методологии Lean, установив верные логические взаимосвязи из данных утверждений. Составьте кодовое слово из первых букв имени этого сотрудника, названия его компании, должности и хобби без пробелов.</p>
                    <p class="text">Каждые сотрудник, компания, должность, методология и хобби имеют только одно явное соответствие между собой. Соседняя компания в рейтинге — та, которая на одну позицию выше или ниже.</p>
                    <p class="text">Утверждения:</p>
                    <ol class="list">
                        <li class="list__item">В рейтинге находятся пять компаний.</li>
                        <li class="list__item">Андрей работает в компании «Д Инк».</li>
                        <li class="list__item">Екатерина работает по методологии AUP.</li>
                        <li class="list__item">В компании «Г Инк» работает директор.</li>
                        <li class="list__item">Владимир работает аналитиком.</li>
                        <li class="list__item">Компания «Г Инк» находится в рейтинге сразу после компании «Б Инк».</li>
                        <li class="list__item">Тот, кто в свободное время спит, работает по методологии XP.</li>
                        <li class="list__item">Тот, кто работает в «В Инк», в свободное время читает.</li>
                        <li class="list__item">В третьей компании рейтинга работает менеджер.</li>
                        <li class="list__item">Светлана работает в первой компании рейтинга.</li>
                        <li class="list__item">Тот, кто работает по методологии Scrum, работает в соседней в рейтинге компанией с тем, кто в свободное время посещает театр.</li>
                        <li class="list__item">Тот, кто в свободное время читает, работает в соседней в рейтинге компанией с тем, кто работает по методологии Kanban.</li>
                        <li class="list__item">Программист любит сериалы.</li>
                        <li class="list__item">Антон в свободное время занимается фитнесом.</li>
                        <li class="list__item">Светлана работает в компании, соседней в рейтинге с «А Инк».</li>
                        <li class="list__item">Кто-то из сотрудников работает консультантом.</li>
                    </ol>
                    <p class="text">Введите полученное кодовое слово в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 10,
                time: 25,
                error: false,
                success: false,
                stepId: 15,
                image: '../image/task_15.svg',
                imageSuccess: '../image/task_15_success.svg',
            }]
        },
        {
            id: 3,
            access: false,
            tasks: [{
                id: 8,
                buttonTitle: 'Обучение ассистента',
                content: '<iframe src="https://learningapps.org/watch?v=pxcaudsma21" frameborder="0"></iframe>',
                preview: `
                    <p class="text">При разработке виртуального ассистента вы применяете Machine Learning — процесс, позволяющий обучать компьютеры, не прибегая к программированию готовых «сценариев поведения» — алгоритмов. Есть несколько типов ML:</p>
                    <ul class="list">
                        <li class="list__item">обучение с учителем (supervised learning);</li>
                        <li class="list__item">обучение без учителя (unsupervised learning);</li>
                        <li class="list__item">обучение с подкреплением (reinforcement learning).</li>
                    </ul>
                    <p class="text">Одна из задач, которую виртуальный ассистент решает с помощью ML, — классификация запросов пользователя. Чтобы дать релевантный ответ, помощнику нужно определить, чего именно хочет пользователь, например совета или инструкции.</p>
                    <p class="text">Для обучения виртуального ассистента этому навыку команда использует обучение с учителем. Данные, подготовленные для этого типа ML, изначально должны содержать правильный ответ. Цель алгоритма — не ответить, а найти взаимосвязь и понять: почему именно так?</p>
                `,
                text: `
                    <p class="text">Вы помогаете с формированием обучающей выборки для тренировки виртуального ассистента. Он учится отвечать на запросы пользователя по брокерскому счету. Вам нужно создать правильные ответы для каждого диалога — элемента выборки. Классифицируйте реплики пользователя на четыре категории: «Инструкции», «Рекомендации», «Обучение», «Работа с возражениями».</p>
                    <p class="text">Вы можете нажимать на элементы, чтобы приближать их, и передвигать, зажав кнопкой мыши. Чтобы закрепить элемент, необходимо отпустить кнопку мыши. Цвет кнопки элемента соответствует цвету группы, за которой он закреплен. В правом нижнем углу — кнопка для подтверждения ответа. Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 14,
                image: '../image/task_14.svg',
                imageSuccess: '../image/task_14_success.svg',
            }, {
                id: 9,
                buttonTitle: 'Лабиринт',
                content: '<iframe src="https://scratch.mit.edu/projects/567561481/embed" frameborder="0"></iframe>',
                preview: '<p class="text">Запросы пользователей к виртуальному ассистенту бывают сложными. Особенно когда они связаны с несколькими продуктами и сервисами — банковскими и партнерскими. Представьте: виртуальный ассистент должен собрать данные из нескольких источников, затем обработать их, а после синтезировать релевантный ответ. Например, подобрать аутфит исходя из погоды и предпочтений пользователя и заказать одежду с доставкой в удобное время. Вокруг слишком много информации — пришло время научиться максимально эффективно ее обрабатывать.</p>',
                text: '<p class="text">Помогите ассистенту пройти лабиринт и добраться до нужных сведений, не сбившись с пути и не задевая стены лабиринта.</p><p class="text">Управление стрелками на клавиатуре. Введите полученный в награду код в поле ответа под заданием.</p>',
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 13,
                image: '../image/task_13.svg',
                imageSuccess: '../image/task_13_success.svg',
            }, {
                id: 10,
                buttonTitle: 'Игра в ассоциации',
                content: '<iframe src="https://learningapps.org/watch?v=p5gfh9xi321" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Комбинации voice only и voice+text не покрывают полный спектр запросов пользователя и сценариев использования виртуального ассистента через различные устройства. Поэтому вы решили интегрировать voice first — модель, которая позволяет взаимодействовать с виртуальным ассистентом, используя и голос, и графику.</p>
                    <p class="text">Для общения с ассистентом через визуальный интерфейс используют умные экраны или Smart TV. Виртуальный помощник в таком устройстве должен не только помогать с рекомендацией фильма, но и уметь отвечать на вопросы из разряда «Помоги вспомнить фильм, в котором...».</p>
                `,
                text: `
                    <p class="text">Обучите виртуального ассистента подбирать фильм по ассоциативному ряду эмодзи. Сегодняшняя партия фильмов посвящена будущему, в котором нас ожидает как дружба с роботами, так и возможное восстание машин. Такие картины помогают предсказать возможные риски и предложить методы их нивелирования. Помогите помощнику отгадать, что это за фильмы!</p>
                    <p class="text">Названия не содержат специальных символов и могут состоять как из одного, так и из нескольких слов, все буквы русские, любого регистра, можно использовать запятые. Введите полученный в награду код в поле ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 12,
                image: '../image/task_12.svg',
                imageSuccess: '../image/task_12_success.svg',
            }],
        }, {
            id: 4,
            access: false,
            tasks: [{
                id: 11,
                buttonTitle: 'Безопасный путь клиента',
                content: '<iframe src="https://learningapps.org/watch?v=pctzm5qwn21" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Для доступа к вашему виртуальному помощнику пользователь должен подтвердить свою личность — это обеспечивает сохранность персональных данных клиентов.</p>
                    <p class="text">Вчера вечером произошла хакерская атака. Вам удалось спасти все данные пользователей и предотвратить утечку, но сам алгоритм входа сломался.</p>
                `,
                text: `
                    <p class="text">Восстановите схему алгоритма безопасности, расставив по своим местам выпавшие блоки.</p>
                    <p class="text">Нажимайте на специальные маркеры, чтобы выбрать, что находится в соответствующей ячейке. В открывающемся окне нажимайте на элемент, чтобы приблизить его или закрепить на маркере по кнопке «Выбрать». Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 11,
                image: '../image/task_11.svg',
                imageSuccess: '../image/task_11_success.svg',
            }, {
                id: 12,
                buttonTitle: 'Техподдержка',
                content: `<iframe src="https://changellenge.typeform.com/to/nBM8lVC9" frameborder="0"><iframe>`,
                preview: `
                    <p class="text">Иногда у пользователей может случиться ошибка в приложении, или что-то будет работать не так, как они того ожидают. В такой ситуации пользователь может позвонить на горячую линию, чтобы решить свою проблему. Но не всегда пользователь может получить быстрый доступ к операторам, если их не хватает, чтобы ответить на большое количество звонков. Здесь на помощь приходит виртуальный ассистент, который может решать определенные проблемы пользователей и отвечать на их запросы.</p>
                `,
                text: `
                    <p class="text">Помогите виртуальному ассистенту правильно ответить на возражения пользователя и решить его проблему. На каждое сообщение пользователя будет доступно на выбор четыре варианта ответа. Только один из них верный.</p>
                    <p class="text">Введите полученный в награду ответ в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 10,
                image: '../image/task_10.svg',
                imageSuccess: '../image/task_10_success.svg',
            }, {
                id: 13,
                buttonTitle: 'КОДовое слово',
                content: '<iframe src="https://replit.com/@claandreev/DGTLFEST2021" frameborder="0"></iframe>',
                preview: '<p class="text">На протяжении нескольких недель вы тестировали новые способы передачи данных и шифрования. Они однозначно будут быстрее и помогут лучше и безопаснее взаимодействовать с виртуальным помощником. Но что-то пошло не так — пропало исходное кодовое слово, при помощи которого шифровалась информация.</p>',
                text: `
                    <p class="text">Помогите восстановить кодовое слово — напишите программный код или используйте любой другой способ.</p>
                    <p class="text">Для этого перейдите на вкладку Code внизу консоли. После знака «#» показан код, с помощью которого буквы оригинального слова были переведены в байты и перемешаны. В списке byte_list в строках 8—10 находится результат выполненной программы — перемешанные буквы в виде байтов. </p>
                    <p class="text">Если вы случайно удалите код или его часть, скопируйте его в сервис, чтобы восстановить:</p>
                    <code>
                        #import random#<br>
                        #original_word=...<br>
                        #import random<br>
                        #<br>
                        #original_word = ...<br>
                        #byte_list = [i for i in map(bin, bytearray(original_word, 'utf8'))]<br>
                        #random.shuffle(byte_list)<br>
                        <br>
                        byte_list = ['0b1000001', '0b1010010', '0b1010111', '0b1000101',<br>
                                    '0b1010010', '0b1001011', '0b1001111', '0b1001101',<br>
                                    '0b1000110']<br>
                        shuffle_word = ...<br>
                        print(shuffle_word)
                    </code>
                `,
                answer: '',
                points: 10,
                time: 25,
                error: false,
                success: false,
                stepId: 9,
                image: '../image/task_9.svg',
                imageSuccess: '../image/task_9_success.svg',
            }],
        }, {
            id: 5,
            access: false,
            tasks: [{
                id: 14,
                buttonTitle: 'Веб-квест',
                content: `<a class="button" href="https://www.raiffeisen.ru/new/" target="_blank" rel="nofollow">На сайт Райффайзенбанка</a>`,
                preview: `
                    <p class="text">Вспомните 2020 год: пандемия, снижение ставок по вкладам и развитие сервисов для торговли ценными бумагами — все привело к популярности частных инвестиций у обычных пользователей. В 2030 году мало кто обходится без брокерского счета, и Райффайзенбанк предоставляет эту услугу пользователям как одну из основных. Это значит, что виртуальный ассистент должен безукоризненно обрабатывать запросы пользователей, связанные с инвестициями.</p>
                    <p class="text">Чтобы доработать функционал и дополнить сценарии помощника актуальными вопросами, вы обращаетесь к команде финансовых аналитиков Райффайзенбанка. </p>
                `,
                text: `
                    <p class="text">Найдите на сайте Райффайзенбанка информацию о команде аналитиков. Запишите число аналитиков словом — это анаграмма. Из букв этого слова составьте название электронного компонента.</p>
                    <p class="text">Введите полученное слово в поле ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 8,
                image: '../image/task_8.svg',
                imageSuccess: '../image/task_8_success.svg',
            }, {
                id: 15,
                buttonTitle: 'Что хотел сказать клиент?',
                content: '<iframe src="https://survey.alchemer.com/s3/6587240/wtf" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Виртуальному ассистенту нужно быть готовым к общению с любыми клиентами. Пользователи не всегда могут структурировать свои мысли. Как на это реагировать помощнику? Несмотря ни на что, он должен четко выявлять запрос и решать задачи клиента.</p>
                `,
                text: `
                    <p class="text">Для того чтобы оценить, насколько виртуальный ассистент справляется даже с самыми сложными запросами, вам нужно и самим разобраться, что именно имел в виду клиент. Прослушайте запись обращения клиента в техподдержку и помогите разобраться в его реальном запросе.</p>
                    <p class="text">Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 7,
                image: '../image/task_7.svg',
                imageSuccess: '../image/task_7_success.svg',
            }, {
                id: 16,
                buttonTitle: 'Шифрование',
                content: null,
                preview: `
                    <p class="text">Распространение виртуальных ассистентов началось с банкинга, финансов и телекома — сфер, где защита данных имеет особое значение. Пользователи выбирают те инструменты, которые обеспечивают защиту и безопасную передачу их данных, информации о платежах и других важных сведений.</p>
                    <p class="text">В 2030 году рынок виртуальных ассистентов растет: помощники появляются в ритейле, e-commerce и сервисных услугах. Теперь важность безопасности данных выходит на новый уровень. Шопинг, покупка недвижимости с помощью виртуального ассистента, запись на услуги, в том числе медицинские и косметологические, — огромный объем пользовательских данных обрабатывают и передают персональные помощники. Здесь и сейчас критически важно обеспечить безопасность информации.</p>
                `,
                text: `
                    <p class="text">Последний прототип ассистента настолько увлекся обеспечением сохранности данных, что удалил мастер-ключ для восстановления слогана, с которым ему предстоит предстать перед пользователями во время релиза. Расшифруйте фразу «Фноьк рпнпъойл ёнб обжзм ёшишюйзу», чтобы восстановить мастер-ключ — все гласные из восстановленной фразы по порядку.</p>
                    <p class="text">Введите полученный мастер-ключ в поле ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 6,
                image: '../image/task_6.svg',
                imageSuccess: '../image/task_6_success.svg',
            }],
        }, {
            id: 6,
            access: false,
            tasks: [{
                id: 17,
                buttonTitle: 'Сплит',
                content: '<iframe src="https://learningapps.org/watch?v=p15eqd6g221" frameborder="0"></iframe>',
                preview: `
                    <p class="text">В жизни пользователь общается с разными людьми, и у каждого из них своя манера общения, свои особенности, кто-то приятен, кто-то нет, общение с кем-то пользователь выбирает, а с кем-то приходится общаться, несмотря на свои пожелания. </p>
                    <p class="text">Команда виртуального ассистента выдвинула гипотезу, что помощник сможет органично вписаться в жизнь пользователя, если у человека будет возможность выбрать из нескольких вариантов его «личности». Несмотря на идентичный функционал, манера общения у этих личностей, элементы визуализации, могут отличаться — в таком случае каждый сможет выбрать виртуального ассистента, лучше всего отвечающего пожеланиям. </p>
                    <p class="text">Виртуальный ассистент должен стать помощником и интересным собеседником для своего пользователя, поэтому нейтральный ассистент не сможет закрыть полный спектр задач проекта. Ему нужны личности с характером, интересами и бэкграундом.                </p>
                `,
                text: `
                    <p class="text">В качестве прототипа было создано четыре модели личности виртуального ассистента:</p>
                    <ul class="list">
                        <li class="list__item">Спокойный виртуальный ассистент, обращается на «вы» и готов поддержать разговор на любую тему.</li>
                        <li class="list__item">Серьезный виртуальный ассистент, общается в деловом формальном стиле и неохотно поддерживает разговор на отвлеченные темы.</li>
                        <li class="list__item">Веселый виртуальный ассистент, обращается на «ты» и обладает чувством юмора.</li>
                        <li class="list__item">Эмоциональный виртуальный ассистент, обращается на «ты» и ярко выраженно на все реагирует: удивляется, радуется, грустит, обижается.</li>
                    </ul>
                    <p class="text">Определите, какой диалог с пользователем к какой личности относится, чтобы обучить виртуального ассистента правильным паттернам взаимодействия.</p>
                    <p class="text">Вы можете нажимать на элементы, чтобы приближать их, и передвигать, зажав кнопкой мыши. Чтобы закрепить элемент, необходимо отпустить кнопку мыши. Цвет кнопки элемента соответствует цвету группы, за которой он закреплен. В правом нижнем углу — кнопка для подтверждения ответа. Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 5,
                image: '../image/task_5.svg',
                imageSuccess: '../image/task_5_success.svg',
            }, {
                id: 18,
                buttonTitle: 'Кто хочет стать миллионером',
                content: '<iframe src="https://learningapps.org/watch?v=pb5bw3k3521" frameborder="0"></iframe>',
                preview: `
                    <p class="text">В 2030 году поддержка малого и среднего бизнеса достигла невероятных масштабов. У каждого третьего человека в стране есть свой бизнес. Райффайзенбанк активно сотрудничает с клиентами этого сегмента и хочет, чтобы виртуальный помощник умел работать и с ними. Это особенно актуально, т.к. отделения банка остались только в крупнейших агломерациях и 90% клиентов малого бизнеса их не посещают. </p>
                    <p class="text">Каждый может стать бизнесменом в 2030 году, но, к сожалению, не каждый сам может разобраться с финансовой составляющей бизнеса: счетами, зарплатами, бухгалтерией и т.д. Задача Райффайзенбанка и виртуального помощника не только облегчить рутину клиенту, но и помочь ему в развитии бизнеса.                 </p>
                `,
                text: `
                    <p class="text">Сыграйте в игру «Кто хочет стать миллионером?» за виртуального помощника и помогите Аркадию Ивановичу Сидорову построить успешный бизнес.</p>
                    <p class="text">Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 4,
                image: '../image/task_4.svg',
                imageSuccess: '../image/task_4_success.svg',
            }, {
                id: 19,
                buttonTitle: 'Escape the room',
                content: '<iframe src="https://www.learnis.ru/498906/" frameborder="0"></iframe>',
                preview: '<p class="text">Виртуальный ассистент Райффайзенбанка должен находить общий язык с любым пользователем. Особенно с поколением «альфа» — молодыми людьми, которые являются основными пользователями виртуальных сервисов банка. Для этого к его разработке привлекли талантливого студента. Во время учебы в университете он разработал собственную NLU-модель — модель естественного языка. Она позволяет искусственному интеллекту понимать смысл написанного или сказанного (в том числе сленг, шутки) и даже играть в слова, загадывать загадки.</p><p class="text">При интеграции NLU-модели возникли непредвиденные сложности. Чтобы проверить работу обновленного ассистента и устранить неполадки, вы решили протестировать его и пообщаться в оборудованной для этого комнате. Но вот незадача — после включения ассистент решил подшутить и сыграть с вами в игру.</p><p class="text">«Посмотрим, кто из нас умнее!» — сказал он и заблокировал входную дверь.</p>',
                text: '<p class="text">Сейчас вам нужно отгадать несколько загадок, которые ассистент спрятал в комнате, чтобы собрать код, открывающий дверь. Выберитесь из комнаты и одержите победу в битве «Человек против ИИ»!</p><p class="text">Код для двери состоит из первых букв ответов на загадки и даты. Все буквы прописные, русские, пробелов и других символов в коде нет.</p><p class="text">Введите полученный в награду код в поле ответа под заданием.</p>',
                answer: '',
                points: 10,
                time: 25,
                error: false,
                success: false,
                stepId: 3,
                image: '../image/task_3.svg',
                imageSuccess: '../image/task_3_success.svg',
            }],
        }, {
            id: 7,
            access: true,
            tasks: [{
                id: 20,
                buttonTitle: 'Конкурентное преимущество',
                content: '<iframe src="https://learningapps.org/watch?v=pkr7gnthj21" frameborder="0"></iframe>',
                preview: `
                    <p class="text">Чтобы усовершенствовать виртуального ассистента и вывести его на международный рынок, вы хотите подключить к разработке ведущих иностранных специалистов Райффайзенбанка. Вы готовите презентацию, чтобы выступить с ней на конференц-связи и привлечь зарубежных коллег к проекту.</p>
                    <p class="text">На одном из слайдов вы хотите разместить схему, отражающую основные преимущества виртуального ассистента для бизнеса.</p>
                `,
                text: `
                    <p class="text">Вы собрали примеры того, как виртуальный ассистент влияет на бизнес-процессы. Теперь вам нужно выделить на их основе шесть главных преимуществ и заполнить ими схему. Сопоставьте примеры и преимущества, чтобы закончить создание слайда.</p>
                    <p class="text">Нажимайте на специальные маркеры, чтобы выбрать, что находится в соответствующей ячейке. В открывающемся окне нажимайте на элемент, чтобы приблизить его или закрепить на маркере по кнопке «Выбрать». Введите полученный в награду код в форму ответа под заданием.</p>
                `,
                answer: '',
                points: 3,
                time: 5,
                error: false,
                success: false,
                stepId: 2,
                image: '../image/task_2.svg',
                imageSuccess: '../image/task_2_success.svg',
            }, {
                id: 21,
                buttonTitle: 'Гео-квест',
                content: `
                    <iframe src="https://www.raiffeisen.ru/offices/" frameborder="0"></iframe>
                    <a class="button" href="https://www.raiffeisen.ru/offices/" target="_blank" style="margin-top: 10px;">
                        Перейти на карту
                    </a>
                `,
                preview: `
                    <p class="text">Универсальный виртуальный ассистент должен ориентироваться по картам. Смотрите сами: многие запросы пользователя можно решить, только используя геопозицию: его, отделений банка, интернет-магазинов, такси, местоположения курьеров.</p>
                    <p class="text">Вы интегрировали в виртуального ассистента модуль работы с картами и геотегами, но периодически он сталкивается с проблемами: неверно определяет оптимальный маршрут и путается, когда вместо точного адреса используют визуальные ориентиры и ближайшие популярные объекты.</p>
                    <p class="text">Чтобы разобраться в проблеме, вы изучили последние запросы к ассистенту: тестировщики искали отделения и банкоматы Райффайзенбанка, ориентируясь на достопримечательности и ассоциации, а не на конкретные адреса.</p>
                `,
                text: `
                    <p class="text">У вас есть точки, из которых ассистент выбирал ответ. Выберите на карте те точки, которые соответствовали запросу. Восстановите фигуру, которую они образуют.</p>
                    <ol class="list">
                        <li class="list__item">Найди отделение на конце желтой ветки. Хочу зайти в банк по пути домой *Адрес: шоссе Энтузиастов 82/2к*</li>
                        <li class="list__item">Поеду с работы *м.Таганская* сразу на дачу *Люберцы*. Где мне пополнить карту?</li>
                        <li class="list__item">Отмечаем ДР Маши в парке Горького. Где снять деньги на подарок? </li>
                        <li class="list__item">Перед матчем ЦСКА — Нижний Новгород нужно успеть поменять деньги. Улетаю уже завтра, утром времени не будет. Где это можно сделать, чтобы недалеко было? </li>
                        <li class="list__item">После универа нужно заскочить в банк. Посоветуй, куда удобнее? </li>
                        <li class="list__item">План на день: тренировка по волейболу на «Динамо» в 17:00, ужин с Машей, снять деньги… А я успею? Есть банкоматы рядом?</li>
                        <li class="list__item">Подруга прилетает в Шереметьево из Сочи по работе в эту субботу — обещала показать ей Москву. Встречу ее с аэроэкспресса и пройдемся до Кремля. Она попросила найти отделение Райфа по пути. Поможешь?</li>
                        <li class="list__item">В субботу мама приезжает из Курска на выходные. Надо забрать ее карту из отделения, пока не уехала, а то опять затянется...</li>
                        <li class="list__item">Мы сняли квартиру в «Зиларт». Где теперь наш ближайший банк? </li>
                        <li class="list__item">В выходные еду с дочкой в павильон космоса, закончим где-то в 16:00. Хочу заскочить в банк на обратном пути. Какое отделение посоветуешь? </li>
                    </ol>
                    <p class="text">Введите название полученной фигуры в поле ответа под заданием.</p>
                `,
                answer: '',
                points: 6,
                time: 10,
                error: false,
                success: false,
                stepId: 1,
                image: '../image/task_1.svg',
                imageSuccess: '../image/task_1_success.svg',
            }],
        }],
        answers: new Map([
            [1, 'PROJECT'],
            [2, 'MUCHMONEY'],
            [3, 'СЧЕТОВОД'],
            [4, 'INSIGHT'],
            [5, 'SEARCH'],
            [6, 'MCRIDDLE'],
            [7, 'АГДФ'],
            [8, 'TEACHER'],
            [9, 'SPRINT'],
            [10, 'CYBER'],
            [11, 'HACKSECURITY'],
            [12, 'CUSTOMSUPPORT'],
            [13, 'FRAMEWORK'],
            [14, 'ДИОД'],
            [15, 'SEMANTICANALYSIS'],
            [16, 'УЫООИЯЮЕУУЕО'],
            [17, 'MILLIGAN'],
            [18, 'PROPOSAL'],
            [19, 'TRUEWAY'],
            [20, 'PROCESSES'],
            [21, 'ЗВЕЗДА'],
        ]),
        teamInfo: {
            userId: '', // id пользователя при авторизации (по нему идет выборка в другой таблице)
            teamId: '', // id, который будет использоваться для внесения в базу правильных ответов
            sumPoint: 0
        },
        dateNow: null,
        dateNowInterval: null,
        countdownInfo: {
            startTime: "2021-10-27T18:35:00",
            endTime: "2021-10-27T19:40:00"
        },
        assistantTimeInfo: {
            startTime: "2021-10-28T19:00:00",
            endTime: "2021-10-28T16:00:00"
        },
        resultsPauseInfo: {
            startTime: "2021-10-28T16:44:30",
            endTime: "2021-10-28T16:46:00"
        },
        isLoading: false
    },
    created () {
        const firebaseConfig = {
            apiKey: "AIzaSyCR5TvNl90OZm4PLH1tR2OeA4IyfcgAnXw",
            authDomain: "task-map-69dd0.firebaseapp.com",
            databaseURL: "https://task-map-69dd0-default-rtdb.firebaseio.com",
            projectId: "task-map-69dd0",
            storageBucket: "task-map-69dd0.appspot.com",
            messagingSenderId: "827546998949",
            appId: "1:827546998949:web:1d490785a095972bec954c"
        };

        firebase.initializeApp(firebaseConfig);

        this.dateNowInterval = setInterval(() => {
            this.dateNow = Date.now();
        }, 1000);

        if (localStorage.getItem('teamInfo')) {
            try {
                this.teamInfo = JSON.parse(localStorage.getItem('teamInfo'));

                this.onAuthSuccess();
            } catch (e) {
                localStorage.removeItem('teamInfo');
            }
        }

        this.storyStep = localStorage.getItem('storyStep');
        this.storyStep = this.storyStep ? Number(this.storyStep) : 1;
    },
    beforeDestroy() {
        clearInterval(this.dateNowInterval);
    },
    computed: {
        isStartTime() {
            const startDateTime = new Date(this.countdownInfo.startTime).getTime();

            return this.dateNow >= startDateTime;
        },
        startDateTime() {
            const date = new Date(this.countdownInfo.startTime);
            const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
            const month = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
            const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

            // return `${day}.${month}.${date.getFullYear()} в ${date.getHours()}:${minutes}`;
            return `${date.getHours()}:${minutes}`;
        },
        resultsPauseEndDateTime() {
            const date = new Date(this.resultsPauseInfo.endTime);
            const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

            return `${date.getHours()}:${minutes}`;
        },
    },
    methods: {
        openNextGroup() {
            const accessGroups = this.groups.filter(item => item.access);
            const lastAccessGroupID = accessGroups[accessGroups.length - 1].id;

            const someTaskGroupIdx = this.groups.findIndex(item => {
                return item.id === lastAccessGroupID;
            });

            if (this.groups[someTaskGroupIdx].tasks.some(taskItem => taskItem.success)) {
                const nextGroupIdx = someTaskGroupIdx !== -1 ? someTaskGroupIdx + 1 : null;

                if (nextGroupIdx && this.groups[nextGroupIdx]) {
                    this.$set(this.groups[nextGroupIdx], 'access', true);
                }
            }
        },
        onTaskSuccess(taskInfo) {
            this.openNextGroup();

            this.teamInfo.sumPoint += taskInfo.points;
            localStorage.setItem('teamInfo', JSON.stringify(this.teamInfo));
            this.updateTeamResults(this.teamInfo.teamId, {
                [`answer_${taskInfo.id}`]: taskInfo.points
            });
        },
        onUpdateInfo() {
            this.onAuthSuccess();
        },
        async onAuthSuccess() {
            try {
                const firebaseTasks = await firebase.database().ref('commands').once('value');
                const firebaseTask = firebaseTasks.val();

                const teamInfo = firebaseTask[this.teamInfo.teamId];
                let accessGroups = [];
                let successAnswers = [];

                for (const key in teamInfo) {
                    if (key.includes('answer_')) {
                        successAnswers.push(Number(key.substr('answer_'.length)));
                    }
                }

                successAnswers = successAnswers.sort();

                this.groups.forEach((groupItem, groupIdx) => {
                    if (groupItem.tasks.some(taskItem => successAnswers.includes(taskItem.id))) {
                        const nextGroupIdx = groupIdx + 1;

                        this.$set(this.groups[groupIdx], 'access', true);
                        this.$set(this.groups[nextGroupIdx], 'access', true);

                        if (!accessGroups.includes(groupItem.id)) {
                            accessGroups.push(groupItem.id);
                        }

                        if (!accessGroups.includes(this.groups[nextGroupIdx].id)) {
                            accessGroups.push(this.groups[nextGroupIdx].id);
                        }
                    }

                    groupItem.tasks.forEach(taskItem => {
                        if (successAnswers.includes(taskItem.id)) {
                            taskItem.success = true;
                        }
                    });
                });
            } catch (e) {
                console.log(e);
            }
        },
        transliteration (word) {
            let answer = '';
            let converter = {
                'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
                'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
                'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
                'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
                'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
                'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',
                'э': 'e',    'ю': 'yu',   'я': 'ya',

                'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
                'Е': 'E',    'Ё': 'E',    'Ж': 'Zh',   'З': 'Z',    'И': 'I',
                'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
                'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
                'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'Ch',
                'Ш': 'Sh',   'Щ': 'Sch',  'Ь': '',     'Ы': 'Y',    'Ъ': '',
                'Э': 'E',    'Ю': 'Yu',   'Я': 'Ya'
            };

            for (let i = 0; i < word.length; ++i ) {
                answer += converter[word[i]] || word[i];
            }

            return answer;
        },
        async updateTeamResults (id, teamObject) {
            try {
                await firebase.database().ref('commands').child(id).update(teamObject);
            } catch (e) {
                console.log(e);
            }
        },
        onChangeAuth() {
            this.showRegistration = false;
        },
        onChangeReg() {
            this.showRegistration = true;
        },
        incrementStoryStep(value) {
            this.storyStep = value;

            if (value === 2) {
                this.onAuthSuccess();
            }

            if (value === 3) {
                this.assistantConfirmPopupShow = false;
            }

            localStorage.setItem('storyStep', this.storyStep);
        }
    },
});
