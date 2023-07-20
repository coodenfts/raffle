import authService from '../../services/authService';

const verify = async (req, res) => {
  const { wallet, signature } = req.body;
  const result = await authService.verify(wallet, signature, 2);
  return res.json(result);
}

export default {
  verify
}