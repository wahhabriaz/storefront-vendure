import { Layout } from '@/src/layouts';
import { ContextModel, getStaticPaths, makeStaticProps } from '@/src/lib/getStatic';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { getCollections } from '@/src/graphql/sharedQueries';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterCustomerInputType } from '@/src/graphql/selectors';
import { storefrontApiMutation } from '@/src/graphql/client';
import { Link } from '@/src/components/atoms/Link';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { Input } from '@/src/components/forms/Input';
import { Button } from '@/src/components/molecules/Button';
import { ContentContainer } from '@/src/components/atoms/ContentContainer';
import { useTranslation } from 'next-i18next';

type FormValues = RegisterCustomerInputType & { confirmPassword: string };

const SignIn: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('customer');
    const { register, handleSubmit } = useForm<FormValues>({});

    const onSubmit: SubmitHandler<FormValues> = async data => {
        const { emailAddress, password } = data;

        const { registerCustomerAccount } = await storefrontApiMutation({
            registerCustomerAccount: [
                { input: { emailAddress, password } },
                {
                    __typename: true,
                    '...on MissingPasswordError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on NativeAuthStrategyError': {
                        message: true,
                        errorCode: true,
                    },
                    '...on PasswordValidationError': {
                        errorCode: true,
                        message: true,
                        validationErrorMessage: true,
                    },
                    '...on Success': {
                        success: true,
                    },
                },
            ],
        });

        console.log(registerCustomerAccount);
    };

    return (
        <Layout categories={props.collections}>
            <ContentContainer>
                <Stack w100 justifyCenter itemsCenter>
                    <FormWrapper column itemsCenter gap="1.75rem">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input label={t('email')} type="text" {...register('emailAddress')} />
                            <Input label={t('password')} type="password" {...register('password')} />
                            <Input label={t('confirmPassword')} type="password" {...register('confirmPassword')} />
                            <Button type="submit">{t('signUp')}</Button>
                        </Form>
                        <Stack column itemsCenter gap="0.5rem">
                            <Link href="/customer/forgot-password">{t('forgotPassword')}</Link>
                            <Link href="/customer/sign-in">{t('signIn')}</Link>
                        </Stack>
                    </FormWrapper>
                </Stack>
            </ContentContainer>
        </Layout>
    );
};

const FormWrapper = styled(Stack)`
    padding: 3.75rem 2.5rem;
    border: 1px solid ${({ theme }) => theme.gray(300)};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 0 0.5rem ${({ theme }) => theme.gray(300)};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const getStaticProps = async (context: ContextModel) => {
    const r = await makeStaticProps(['common', 'customer'])(context);
    const collections = await getCollections();

    const returnedStuff = {
        ...r.props,
        collections,
    };

    return {
        props: returnedStuff,
        revalidate: 10,
    };
};

export { getStaticPaths, getStaticProps };
export default SignIn;
